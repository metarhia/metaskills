#!/usr/bin/env node
'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../../../..');
const SCAN = [path.join(ROOT, 'lib'), path.join(ROOT, 'bin')];
const SKIP_DIRS = ['node_modules', '.git'];

const REQUIRE_REL = /require\(\s*(['"])(\.\.?\/[^'"]+)\1\s*\)/g;
const STRING_CALL = /(?<![\w.])String\s*\(/;
const SINGLE = String.fromCharCode(39);
const DOUBLE = String.fromCharCode(34);
const BACKTICK = String.fromCharCode(96);
const QUOTES = `${SINGLE}${DOUBLE}${BACKTICK}`;

const listJs = async (dir) => {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
  const files = [];
  for (const entry of entries) {
    if (SKIP_DIRS.includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await listJs(full);
      for (const file of nested) files.push(file);
      continue;
    }
    if (entry.name.endsWith('.js')) files.push(full);
  }
  return files;
};

const iterJs = async () => {
  const files = [];
  for (const base of SCAN) {
    const found = await listJs(base);
    for (const file of found) files.push(file);
  }
  return files;
};

const codePart = (line) => {
  let quote = null;
  const kept = [];
  let index = 0;
  while (index < line.length) {
    const character = line[index];
    if (quote) {
      kept.push(character);
      if (character === '\\' && index + 1 < line.length) {
        kept.push(line[index + 1]);
        index += 2;
        continue;
      }
      if (character === quote) quote = null;
      index += 1;
      continue;
    }
    if (QUOTES.includes(character)) {
      quote = character;
      kept.push(character);
      index += 1;
      continue;
    }
    if (character === '/' && line[index + 1] === '/') break;
    kept.push(character);
    index += 1;
  }
  return kept.join('');
};

const splitLines = (text) => {
  const lines = text.split(/\r?\n/);
  if (lines.at(-1) !== '') return lines;
  return lines.slice(0, -1);
};

const checkLine = (relativePath, lineNumber, line, errors) => {
  if (line.length > 80) {
    const width = `${relativePath}:${lineNumber}: ${line.length} cols`;
    errors.push(`${width}: ${line}`);
  }
  const code = codePart(line);
  if (STRING_CALL.test(code)) {
    errors.push(`${relativePath}:${lineNumber}: String(: ${line}`);
  }
  REQUIRE_REL.lastIndex = 0;
  for (const match of code.matchAll(REQUIRE_REL)) {
    const spec = match[2];
    if (spec.endsWith('.js')) continue;
    const message = `${relativePath}:${lineNumber}: relative require missing`;
    errors.push(`${message} .js: ${spec}`);
  }
};

const main = async () => {
  const errors = [];
  for (const filePath of await iterJs()) {
    const relativePath = path.relative(ROOT, filePath);
    const text = await fs.readFile(filePath, 'utf8');
    const lines = splitLines(text);
    for (let index = 0; index < lines.length; index += 1) {
      const lineNumber = index + 1;
      checkLine(relativePath, lineNumber, lines[index], errors);
    }
  }
  if (errors.length > 0) {
    console.log(errors.join('\n'));
    console.error(`\n${errors.length} problem(s)`);
    return 1;
  }
  console.log('ok');
  return 0;
};

const run = async () => {
  try {
    const code = await main();
    process.exit(code);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

if (require.main === module) run();

module.exports = { codePart, iterJs, main };
