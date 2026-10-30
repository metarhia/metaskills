#!/usr/bin/env node
'use strict';

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');

const PROJECT_DIR = process.cwd();
const SKILLS_DIR = path.join(PROJECT_DIR, 'node_modules/metaskills/skills');

const IDE_TARGETS = {
  cursor: '.cursor',
  claude: '.claude',
  windsurf: '.windsurf',
  vscode: '.github',
  gemini: '.gemini',
  antigravity: '.agents',
};

const detectTargetDirs = () => {
  const found = [];
  for (const base of Object.values(IDE_TARGETS)) {
    const basePath = path.join(PROJECT_DIR, base);
    if (!fs.existsSync(basePath)) continue;
    if (base === '.github' || base === '.agents') {
      const skillsPath = path.join(basePath, 'skills');
      if (!fs.existsSync(skillsPath)) continue;
    }
    found.push(`${base}/skills`);
  }
  return found;
};

const listSkills = (source) => {
  const names = [];
  const entries = fs.readdirSync(source, { withFileTypes: true });
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (!entry.isDirectory()) continue;
    const manifest = path.join(source, entry.name, 'SKILL.md');
    if (fs.existsSync(manifest)) names.push(entry.name);
  }
  return names.sort();
};

const isInside = (target, dir) => {
  const relative = path.relative(dir, target);
  if (relative === '' || path.isAbsolute(relative)) return false;
  return !relative.startsWith('..');
};

const isOwnedLink = (linkPath, sourcePath) => {
  const linkTarget = fs.readlinkSync(linkPath);
  const resolved = path.resolve(path.dirname(linkPath), linkTarget);
  if (resolved === sourcePath) return true;
  return isInside(resolved, sourcePath);
};

// Agents read <target>/<skill-name>/SKILL.md. The target from the IDE table
// is the symlink, so .cursor/skills points at the package skills folder.
// Older releases added a metaskills directory under that target.
const removeOwnedLinks = (dirPath, sourcePath) => {
  const removed = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (!entry.isSymbolicLink()) continue;
    const linkPath = path.join(dirPath, entry.name);
    if (!isOwnedLink(linkPath, sourcePath)) continue;
    fs.unlinkSync(linkPath);
    removed.push(entry.name);
  }
  removed.sort();
  return removed;
};

const createLink = (linkPath, sourcePath) => {
  const parentPath = path.dirname(linkPath);
  const relativeTarget = path.relative(parentPath, sourcePath);
  fs.symlinkSync(relativeTarget, linkPath, 'dir');
};

const withRemoved = (message, removed) => {
  if (removed.length === 0) return message;
  return `${message}; removed ${removed.join(', ')}`;
};

const linkFresh = (linkPath, sourcePath, targetDir) => {
  createLink(linkPath, sourcePath);
  return {
    created: [targetDir],
    removed: [],
    skipped: [],
    message: `Linked ${targetDir}`,
  };
};

const reuseLink = (linkPath, sourcePath, targetDir) => {
  const linkTarget = fs.readlinkSync(linkPath);
  const resolved = path.resolve(path.dirname(linkPath), linkTarget);
  if (resolved === sourcePath) {
    return {
      created: [],
      removed: [],
      skipped: [],
      message: `Already linked ${targetDir}`,
    };
  }
  const message = `${targetDir} is a symlink; remove it to use skill links`;
  return { created: [], removed: [], skipped: [targetDir], message };
};

const directoryIsReplaceable = (dirPath, sourcePath) => {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (!entry.isSymbolicLink()) return false;
    const linkPath = path.join(dirPath, entry.name);
    if (!isOwnedLink(linkPath, sourcePath)) return false;
  }
  return true;
};

const replaceDirectory = (linkPath, sourcePath, targetDir) => {
  if (!directoryIsReplaceable(linkPath, sourcePath)) {
    const message = `${targetDir} exists and is not a symlink; skip`;
    return { created: [], removed: [], skipped: [targetDir], message };
  }
  const removed = removeOwnedLinks(linkPath, sourcePath);
  fs.rmdirSync(linkPath);
  createLink(linkPath, sourcePath);
  return {
    created: [targetDir],
    removed,
    skipped: [],
    message: withRemoved(`Linked ${targetDir}`, removed),
  };
};

const ensureSkillLinks = (targetDir, dirs = {}) => {
  const { root = PROJECT_DIR, source = SKILLS_DIR } = dirs;
  const linkPath = path.join(root, targetDir);
  const sourcePath = path.resolve(source);
  fs.mkdirSync(path.dirname(linkPath), { recursive: true });
  const stat = fs.lstatSync(linkPath, { throwIfNoEntry: false });
  if (!stat) return linkFresh(linkPath, sourcePath, targetDir);
  if (stat.isSymbolicLink()) return reuseLink(linkPath, sourcePath, targetDir);
  return replaceDirectory(linkPath, sourcePath, targetDir);
};

const addToIgnoreFile = (filePath, entry) => {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  if (lines.includes(entry)) return;
  const isTerminated = content === '' || content.endsWith('\n');
  const sep = isTerminated ? '' : '\n';
  const updated = `${content}${sep}${entry}\n`;
  fs.writeFileSync(filePath, updated);
};

const ensureIgnored = (targetDirs) => {
  const gitignore = path.join(PROJECT_DIR, '.gitignore');
  const npmignore = path.join(PROJECT_DIR, '.npmignore');
  for (let i = 0; i < targetDirs.length; i++) {
    const entry = targetDirs[i];
    addToIgnoreFile(gitignore, entry);
    addToIgnoreFile(npmignore, entry);
  }
};

const ensureInstalled = () => {
  const pkgPath = path.join(PROJECT_DIR, 'package.json');
  if (!fs.existsSync(pkgPath)) return;
  const localPkg = path.join(PROJECT_DIR, 'node_modules', 'metaskills');
  if (fs.existsSync(localPkg)) return;
  console.log('Installing metaskills as dev dependency...');
  execSync('npm install metaskills --save-dev', {
    cwd: PROJECT_DIR,
    stdio: 'inherit',
  });
};

const main = () => {
  ensureInstalled();

  if (!fs.existsSync(SKILLS_DIR)) {
    console.error('metaskills: node_modules/metaskills/skills not found.');
    process.exit(1);
  }
  const source = SKILLS_DIR;

  const ide = (process.argv[2] || process.env.LINK_IDE || '').toLowerCase();
  const ideNames = Object.keys(IDE_TARGETS);

  const runLink = (targetDir) => {
    try {
      const result = ensureSkillLinks(targetDir, { source });
      if (result.skipped.length === 0) ensureIgnored([targetDir]);
      console.log(result.message);
    } catch (error) {
      console.error(`Failed to link ${targetDir}:`, error.message);
      process.exit(1);
    }
  };

  const doRunLink = (selected) => {
    const toTarget = (base) => `${base}/skills`;
    const dirsToLink = [];
    if (selected === 'all') {
      dirsToLink.push(...Object.values(IDE_TARGETS).map(toTarget));
    } else if (IDE_TARGETS[selected]) {
      dirsToLink.push(toTarget(IDE_TARGETS[selected]));
    }

    if (dirsToLink.length === 0) {
      console.error(`Unknown ide: ${selected}`);
      process.exit(1);
    }

    for (const targetDir of dirsToLink) runLink(targetDir);
  };

  if (ide) return void doRunLink(ide);

  const detectedDirs = detectTargetDirs();
  if (detectedDirs.length > 0) {
    for (const targetDir of detectedDirs) runLink(targetDir);
    return;
  }

  const menu = ideNames.map((name, i) => `${i + 1}) ${name}`).join(' ');
  const allIdx = ideNames.length + 1;
  console.log(`\nSelect IDE or AI Agent: ${menu} ${allIdx}) all\n`);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('> ', (answer) => {
    rl.close();
    const n = parseInt(answer, 10);
    if (n >= 1 && n <= allIdx) {
      const selected = n === allIdx ? 'all' : ideNames[n - 1];
      doRunLink(selected);
    } else {
      console.error('Invalid choice');
      process.exit(1);
    }
  });
};

if (require.main === module) main();

module.exports = { ensureSkillLinks, listSkills };
