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

// Harnesses discover only <dir>/skills/<name>/SKILL.md, one level deep,
// so each skill gets its own link; earlier versions linked the whole
// folder as <dir>/skills/metaskills, which agents never loaded
const removeStaleLinks = (parentPath, source, names) => {
  const removed = [];
  const sourcePath = path.resolve(source);
  const entries = fs.readdirSync(parentPath, { withFileTypes: true });
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (!entry.isSymbolicLink()) continue;
    const linkPath = path.join(parentPath, entry.name);
    const target = path.resolve(parentPath, fs.readlinkSync(linkPath));
    const isLegacy = target === sourcePath;
    if (!isLegacy && !isInside(target, sourcePath)) continue;
    const expected = path.join(sourcePath, entry.name);
    const isCurrent = names.includes(entry.name) && target === expected;
    if (isCurrent) continue;
    fs.unlinkSync(linkPath);
    removed.push(entry.name);
  }
  return removed;
};

const describeLinks = (targetDir, created, removed, skipped) => {
  const parts = [];
  if (created.length > 0) parts.push(`linked ${created.join(', ')}`);
  if (removed.length > 0) parts.push(`removed ${removed.join(', ')}`);
  if (skipped.length > 0) parts.push(`skipped ${skipped.join(', ')}`);
  if (parts.length === 0) return 'Already linked ' + targetDir;
  return `${targetDir}: ${parts.join('; ')}`;
};

const ensureSkillLinks = (targetDir, dirs = {}) => {
  const { root = PROJECT_DIR, source = SKILLS_DIR } = dirs;
  const parentPath = path.join(root, targetDir);
  const created = [];
  const removed = [];
  const skipped = [];

  if (!fs.existsSync(parentPath)) {
    fs.mkdirSync(parentPath, { recursive: true });
  } else if (fs.lstatSync(parentPath).isSymbolicLink()) {
    const message = `${targetDir} is a symlink; remove it to use skill links`;
    return { created, removed, skipped, message };
  }

  const linkPath = path.join(parentPath, 'metaskills');
  try {
    const stat = fs.lstatSync(linkPath);
    if (stat.isSymbolicLink()) {
      const resolved = path.resolve(parentPath, fs.readlinkSync(linkPath));
      if (resolved === path.resolve(source)) {
        return {
          created: false,
          message: `Already linked ${targetDir}`,
        };
      }
  const names = listSkills(source);
  const stale = removeStaleLinks(parentPath, source, names);
  for (let i = 0; i < stale.length; i++) removed.push(stale[i]);

  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const linkPath = path.join(parentPath, name);
    const skillPath = path.join(source, name);
    const stat = fs.lstatSync(linkPath, { throwIfNoEntry: false });
    if (stat) {
      const isLink = stat.isSymbolicLink();
      const target = isLink ? fs.readlinkSync(linkPath) : '';
      const resolved = path.resolve(parentPath, target);
      const isOwn = isLink && resolved === path.resolve(skillPath);
      if (!isOwn) skipped.push(name);
      continue;
    }
    const relativeTarget = path.relative(parentPath, skillPath);
    fs.symlinkSync(relativeTarget, linkPath, 'dir');
    created.push(name);
  }

  const message = describeLinks(targetDir, created, removed, skipped);
  return { created, removed, skipped, message };
};

const addToIgnoreFile = (filePath, entry) => {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  if (lines.includes(entry)) return;
  const sep = content.endsWith('\n') ? '' : '\n';
  const updated = `${content + sep + entry}\n`;
  const isTerminated = content === '' || content.endsWith('\n');
  const sep = isTerminated ? '' : '\n';
  const updated = content + sep + entry + '\n';
  fs.writeFileSync(filePath, updated);
};

const ensureIgnored = (names) => {
  const gitignore = path.join(PROJECT_DIR, '.gitignore');
  const npmignore = path.join(PROJECT_DIR, '.npmignore');
  for (let i = 0; i < names.length; i++) {
    const entry = `*/skills/${names[i]}`;
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
  ensureIgnored(listSkills(source));

  const ide = (process.argv[2] || process.env.LINK_IDE || '').toLowerCase();
  const ideNames = Object.keys(IDE_TARGETS);

  const runLink = (targetDir) => {
    try {
      const result = ensureSkillLinks(targetDir, { source });
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
