'use strict';

const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');

const { ensureSkillLinks, listSkills } = require('../scripts/link-ide.js');

const packageRoot = path.resolve(__dirname, '..');
const TARGET_DIR = '.cursor/skills';

const createFixture = (names) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'metaskills-'));
  const source = path.join(root, 'skills');
  for (let i = 0; i < names.length; i++) {
    const skillPath = path.join(source, names[i]);
    fs.mkdirSync(skillPath, { recursive: true });
    fs.writeFileSync(path.join(skillPath, 'SKILL.md'), `# ${names[i]}\n`);
  }
  return { root, source };
};

const removeFixture = (fixture) => {
  fs.rmSync(fixture.root, { recursive: true, force: true });
};

const resolveLink = (linkPath) => {
  const target = fs.readlinkSync(linkPath);
  return path.resolve(path.dirname(linkPath), target);
};

test('package root has scripts/ and package.json', () => {
  assert.ok(fs.existsSync(path.join(packageRoot, 'scripts')));
  assert.ok(fs.existsSync(path.join(packageRoot, 'package.json')));
});

test('every published skill is discoverable', () => {
  const names = listSkills(path.join(packageRoot, 'skills'));
  assert.ok(names.length > 0);
  assert.ok(names.includes('js-conventions'));
});

test('listSkills ignores folders without SKILL.md', () => {
  const fixture = createFixture(['alpha', 'beta']);
  try {
    fs.mkdirSync(path.join(fixture.source, 'assets'));
    assert.deepStrictEqual(listSkills(fixture.source), ['alpha', 'beta']);
  } finally {
    removeFixture(fixture);
  }
});

test('ensureSkillLinks links each skill one level deep', () => {
  const fixture = createFixture(['alpha', 'beta']);
  try {
    const result = ensureSkillLinks(TARGET_DIR, fixture);
    assert.deepStrictEqual(result.created, ['alpha', 'beta']);
    const names = ['alpha', 'beta'];
    for (let i = 0; i < names.length; i++) {
      const linkPath = path.join(fixture.root, TARGET_DIR, names[i]);
      assert.ok(fs.lstatSync(linkPath).isSymbolicLink());
      const expected = path.join(fixture.source, names[i]);
      assert.strictEqual(resolveLink(linkPath), expected);
      assert.ok(fs.existsSync(path.join(linkPath, 'SKILL.md')));
    }
  } finally {
    removeFixture(fixture);
  }
});

test('ensureSkillLinks skips existing correct links', () => {
  const fixture = createFixture(['alpha']);
  try {
    ensureSkillLinks(TARGET_DIR, fixture);
    const result = ensureSkillLinks(TARGET_DIR, fixture);
    assert.strictEqual(result.created.length, 0);
    assert.ok(result.message.includes('Already linked'));
  } finally {
    removeFixture(fixture);
  }
});

test('ensureSkillLinks replaces the legacy grouped link', () => {
  const fixture = createFixture(['alpha']);
  try {
    const parentPath = path.join(fixture.root, TARGET_DIR);
    fs.mkdirSync(parentPath, { recursive: true });
    const legacyPath = path.join(parentPath, 'metaskills');
    const legacyTarget = path.relative(parentPath, fixture.source);
    fs.symlinkSync(legacyTarget, legacyPath, 'dir');
    const result = ensureSkillLinks(TARGET_DIR, fixture);
    assert.deepStrictEqual(result.removed, ['metaskills']);
    assert.deepStrictEqual(result.created, ['alpha']);
    const legacy = fs.lstatSync(legacyPath, { throwIfNoEntry: false });
    assert.strictEqual(legacy, undefined);
  } finally {
    removeFixture(fixture);
  }
});

test('ensureSkillLinks removes links to deleted skills', () => {
  const fixture = createFixture(['alpha', 'beta']);
  try {
    ensureSkillLinks(TARGET_DIR, fixture);
    const betaPath = path.join(fixture.source, 'beta');
    fs.rmSync(betaPath, { recursive: true, force: true });
    const result = ensureSkillLinks(TARGET_DIR, fixture);
    assert.deepStrictEqual(result.removed, ['beta']);
    const linkPath = path.join(fixture.root, TARGET_DIR, 'beta');
    const stat = fs.lstatSync(linkPath, { throwIfNoEntry: false });
    assert.strictEqual(stat, undefined);
  } finally {
    removeFixture(fixture);
  }
});

test('ensureSkillLinks keeps user skills with the same name', () => {
  const fixture = createFixture(['alpha']);
  try {
    const ownPath = path.join(fixture.root, TARGET_DIR, 'alpha');
    fs.mkdirSync(ownPath, { recursive: true });
    const result = ensureSkillLinks(TARGET_DIR, fixture);
    assert.deepStrictEqual(result.skipped, ['alpha']);
    assert.ok(!fs.lstatSync(ownPath).isSymbolicLink());
  } finally {
    removeFixture(fixture);
  }
});
