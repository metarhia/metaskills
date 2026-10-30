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

test('ensureSkillLinks symlinks the target directory', () => {
  const fixture = createFixture(['alpha', 'beta']);
  try {
    const result = ensureSkillLinks(TARGET_DIR, fixture);
    assert.deepStrictEqual(result.created, [TARGET_DIR]);
    const linkPath = path.join(fixture.root, TARGET_DIR);
    assert.ok(fs.lstatSync(linkPath).isSymbolicLink());
    assert.strictEqual(resolveLink(linkPath), fixture.source);
    const names = ['alpha', 'beta'];
    for (let i = 0; i < names.length; i++) {
      const manifest = path.join(linkPath, names[i], 'SKILL.md');
      assert.ok(fs.existsSync(manifest));
    }
  } finally {
    removeFixture(fixture);
  }
});

test('ensureSkillLinks skips an existing correct link', () => {
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
    assert.deepStrictEqual(result.created, [TARGET_DIR]);
    const linkPath = path.join(fixture.root, TARGET_DIR);
    assert.ok(fs.lstatSync(linkPath).isSymbolicLink());
    assert.strictEqual(resolveLink(linkPath), fixture.source);
    const legacy = fs.lstatSync(legacyPath, { throwIfNoEntry: false });
    assert.strictEqual(legacy, undefined);
    assert.ok(fs.existsSync(path.join(linkPath, 'alpha', 'SKILL.md')));
  } finally {
    removeFixture(fixture);
  }
});

test('ensureSkillLinks replaces per-skill links in an empty directory', () => {
  const fixture = createFixture(['alpha', 'beta']);
  try {
    const parentPath = path.join(fixture.root, TARGET_DIR);
    fs.mkdirSync(parentPath, { recursive: true });
    const names = ['alpha', 'beta'];
    for (let i = 0; i < names.length; i++) {
      const skillPath = path.join(fixture.source, names[i]);
      const relativeTarget = path.relative(parentPath, skillPath);
      fs.symlinkSync(relativeTarget, path.join(parentPath, names[i]), 'dir');
    }
    const result = ensureSkillLinks(TARGET_DIR, fixture);
    assert.deepStrictEqual(result.removed, ['alpha', 'beta']);
    assert.deepStrictEqual(result.created, [TARGET_DIR]);
    const linkPath = path.join(fixture.root, TARGET_DIR);
    assert.strictEqual(resolveLink(linkPath), fixture.source);
  } finally {
    removeFixture(fixture);
  }
});

test('ensureSkillLinks follows the package skills folder', () => {
  const fixture = createFixture(['alpha']);
  try {
    ensureSkillLinks(TARGET_DIR, fixture);
    const betaPath = path.join(fixture.source, 'beta');
    fs.mkdirSync(betaPath);
    fs.writeFileSync(path.join(betaPath, 'SKILL.md'), '# beta\n');
    const linked = path.join(fixture.root, TARGET_DIR, 'beta', 'SKILL.md');
    assert.ok(fs.existsSync(linked));
    fs.rmSync(betaPath, { recursive: true, force: true });
    assert.strictEqual(fs.existsSync(linked), false);
  } finally {
    removeFixture(fixture);
  }
});

test('ensureSkillLinks keeps a directory with its own files', () => {
  const fixture = createFixture(['alpha']);
  try {
    const parentPath = path.join(fixture.root, TARGET_DIR);
    const ownPath = path.join(parentPath, 'alpha');
    fs.mkdirSync(ownPath, { recursive: true });
    const legacyPath = path.join(parentPath, 'metaskills');
    const legacyTarget = path.relative(parentPath, fixture.source);
    fs.symlinkSync(legacyTarget, legacyPath, 'dir');
    const result = ensureSkillLinks(TARGET_DIR, fixture);
    assert.deepStrictEqual(result.skipped, [TARGET_DIR]);
    assert.deepStrictEqual(result.removed, []);
    assert.ok(!fs.lstatSync(parentPath).isSymbolicLink());
    assert.ok(!fs.lstatSync(ownPath).isSymbolicLink());
    assert.ok(fs.lstatSync(legacyPath).isSymbolicLink());
  } finally {
    removeFixture(fixture);
  }
});

test('ensureSkillLinks keeps a symlink to another directory', () => {
  const fixture = createFixture(['alpha']);
  try {
    const other = path.join(fixture.root, 'other-skills');
    fs.mkdirSync(path.join(fixture.root, '.cursor'), { recursive: true });
    const linkPath = path.join(fixture.root, TARGET_DIR);
    fs.symlinkSync(other, linkPath, 'dir');
    const result = ensureSkillLinks(TARGET_DIR, fixture);
    assert.deepStrictEqual(result.skipped, [TARGET_DIR]);
    assert.strictEqual(resolveLink(linkPath), other);
  } finally {
    removeFixture(fixture);
  }
});
