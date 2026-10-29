'use strict';

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { ensureSkillLinks } = require('../scripts/link-ide.js');
const { CASES } = require('./cases.js');

const SKILLS_DIR = path.resolve(__dirname, '../skills');
const MODEL = process.env.EVAL_MODEL ?? 'sonnet';
const RUNS = Number(process.env.EVAL_RUNS ?? 1);
const KEEP = process.env.EVAL_KEEP === '1';
const TIMEOUT_MS = 600_000;
const EDIT_TOOLS = ['Write', 'Edit', 'MultiEdit'];

const createProject = () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'metaskills-eval-'));
  const manifest = JSON.stringify({ name: 'eval-project', private: true });
  fs.writeFileSync(path.join(root, 'package.json'), manifest);
  ensureSkillLinks('.claude/skills', { root, source: SKILLS_DIR });
  return root;
};

const runAgent = (root, prompt) => {
  const args = ['-p', prompt, '--model', MODEL];
  args.push('--output-format', 'stream-json', '--verbose');
  args.push('--permission-mode', 'acceptEdits');
  const options = { cwd: root, encoding: 'utf8', timeout: TIMEOUT_MS };
  options.maxBuffer = 64 * 1024 * 1024;
  const result = spawnSync('claude', args, options);
  if (result.error) throw result.error;
  return result.stdout;
};

const collectTools = (output) => {
  const tools = [];
  const lines = output.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.startsWith('{')) continue;
    const event = JSON.parse(line);
    if (event.type !== 'assistant') continue;
    const content = event.message.content;
    for (let j = 0; j < content.length; j++) {
      const block = content[j];
      if (block.type === 'tool_use') tools.push(block);
    }
  }
  return tools;
};

const checkTools = (testCase, tools, failures) => {
  const invoked = [];
  let firstEdit = -1;
  let skillAt = -1;
  let hasRead = false;
  for (let i = 0; i < tools.length; i++) {
    const tool = tools[i];
    const isEdit = EDIT_TOOLS.includes(tool.name);
    if (isEdit && firstEdit === -1) firstEdit = i;
    if (tool.name === 'Skill') {
      const skill = tool.input.skill;
      invoked.push(skill);
      if (skill === testCase.noSkill) failures.push(`invoked ${skill}`);
      if (skill === testCase.skill && skillAt === -1) skillAt = i;
    }
    const filePath = tool.input.file_path ?? '';
    const isRead = tool.name === 'Read' && testCase.read !== undefined;
    if (isRead && filePath.includes(testCase.read)) hasRead = true;
  }
  if (testCase.skill) {
    if (skillAt === -1) failures.push(`${testCase.skill} not invoked`);
    const isLate = skillAt !== -1 && firstEdit !== -1 && skillAt > firstEdit;
    if (isLate) failures.push(`${testCase.skill} invoked after first edit`);
  }
  if (testCase.read && !hasRead) failures.push(`did not read ${testCase.read}`);
  const skills = invoked.length > 0 ? invoked.join(', ') : 'none';
  if (failures.length > 0) failures.push(`skills invoked: ${skills}`);
};

const checkFiles = (testCase, root, failures) => {
  const files = Object.keys(testCase.files);
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const rules = testCase.files[file];
    const filePath = path.join(root, file);
    if (!fs.existsSync(filePath)) {
      failures.push(`${file} not written`);
      continue;
    }
    const source = fs.readFileSync(filePath, 'utf8');
    const required = rules.require ?? [];
    for (let j = 0; j < required.length; j++) {
      const pattern = required[j];
      if (!pattern.test(source)) failures.push(`${file} lacks ${pattern}`);
    }
    const forbidden = rules.forbid ?? [];
    for (let j = 0; j < forbidden.length; j++) {
      const pattern = forbidden[j];
      if (pattern.test(source)) failures.push(`${file} has ${pattern}`);
    }
  }
};

const runCase = (testCase) => {
  const root = createProject();
  const failures = [];
  try {
    const output = runAgent(root, testCase.prompt);
    const tools = collectTools(output);
    checkTools(testCase, tools, failures);
    checkFiles(testCase, root, failures);
  } finally {
    if (KEEP) console.log(`  kept ${root}`);
    else fs.rmSync(root, { recursive: true, force: true });
  }
  return failures;
};

const main = () => {
  const selected = process.argv.slice(2);
  let failed = 0;
  for (let i = 0; i < CASES.length; i++) {
    const testCase = CASES[i];
    const isAll = selected.length === 0;
    if (!isAll && !selected.includes(testCase.name)) continue;
    for (let run = 1; run <= RUNS; run++) {
      const failures = runCase(testCase);
      const status = failures.length === 0 ? 'PASS' : 'FAIL';
      console.log(`${status} ${testCase.name} (run ${run}, ${MODEL})`);
      for (let j = 0; j < failures.length; j++) {
        console.log(`  - ${failures[j]}`);
      }
      if (failures.length > 0) failed++;
    }
  }
  if (failed > 0) process.exitCode = 1;
};

main();
