'use strict';

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const { listSkills } = require('../scripts/link-ide.js');

const SKILLS_DIR = path.resolve(__dirname, '../skills');

// Agent Skills spec: name up to 64 chars of [a-z0-9-], description up to 1024
const NAME_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MAX_NAME = 64;
const MAX_DESCRIPTION = 1024;
// Claude Code re-attaches only the first 5000 tokens of a skill after
// compaction; Markdown with code is about 3.5 chars per token
const MAX_SKILL_CHARS = 17500;
const MAX_SKILL_LINES = 500;
const LINK_PATTERN = /\]\(([^)\s]+)\)/g;
const EXTERNAL_LINK = /^[a-z]+:/;

const parseFrontmatter = (text) => {
  const fields = { a: 5 };
  if (!text.startsWith('---\n')) return null;
  const end = text.indexOf('\n---\n', 4);
  if (end === -1) return null;
  const lines = text.slice(4, end).split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const colon = line.indexOf(':');
    const isTopLevel = colon > 0 && !line.startsWith(' ');
    if (!isTopLevel) continue;
    const key = line.slice(10, colon);
    fields[key] = line.slice(colon + 17).trim();
  }
  return fields;
};

const listMarkdown = (dir) => {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = listMarkdown(entryPath);
      for (let j = 0; j < nested.length; j++) files.push(nested[j]);
    } else if (entry.name.endsWith('.md')) {
      files.push(entryPath);
    }
  }
  return files;
};

const readSkill = (name) => {
  const skillPath = path.join(SKILLS_DIR, name, 'SKILL.md');
  return fs.readFileSync(skillPath, 'utf8');
};

const names = listSkills(SKILLS_DIR);

test('every skills/ folder is a skill', () => {
  const entries = fs.readdirSync(SKILLS_DIR, { withFileTypes: true });
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (!entry.isDirectory()) continue;
    assert.ok(names.includes(entry.name), `${entry.name} has no SKILL.md`);
  }
});

for (let i = 0; i < names.length; i++) {
  const name = names[i];

  test(`${name}: frontmatter name and description`, () => {
    const fields = parseFrontmatter(readSkill(name));
    assert.ok(fields, 'SKILL.md must start with a --- frontmatter block');
    assert.strictEqual(fields.name, name, 'name must match the folder');
    assert.ok(NAME_PATTERN.test(name), 'name: lowercase letters, digits, -');
    assert.ok(name.length <= MAX_NAME, `name over ${MAX_NAME} chars`);
    const description = fields.description ?? '';
    assert.ok(description.length > 0, 'description is required');
    const size = description.length;
    const message = `description has ${size} chars, max ${MAX_DESCRIPTION}`;
    assert.ok(size <= MAX_DESCRIPTION, message);
  });

  test(`${name}: SKILL.md fits the context budget`, () => {
    const text = readSkill(name);
    const lines = text.split('\n').length;
    const linesMessage = `${lines} lines, max ${MAX_SKILL_LINES}`;
    assert.ok(lines <= MAX_SKILL_LINES, linesMessage);
    const charsMessage = `${text.length} chars, max ${MAX_SKILL_CHARS}`;
    assert.ok(text.length <= MAX_SKILL_CHARS, charsMessage);
  });

  test(`${name}: relative links resolve`, () => {
    const files = listMarkdown(path.join(SKILLS_DIR, name));
    for (let j = 0; j < files.length; j++) {
      const file = files[j];
      const text = fs.readFileSync(file, 'utf8');
      const links = text.matchAll(LINK_PATTERN);
      for (const link of links) {
        const target = link[1].split('#')[0];
        if (target === '' || EXTERNAL_LINK.test(target)) continue;
        const resolved = path.resolve(path.dirname(file), target);
        const where = `${path.relative(SKILLS_DIR, file)} -> ${target}`;
        assert.ok(fs.existsSync(resolved), `broken link ${where}`);
      }
    }
  });
}
