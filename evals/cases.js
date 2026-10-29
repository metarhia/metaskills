'use strict';

// skill: must be invoked before the first file edit
// noSkill: must not be invoked at all
// read: a Read call path must contain this fragment
// files: per written file, patterns it must contain and must not contain
const DESTRUCTURING = /\b(const|let|var)\s*\[|\(\s*\[[\w\s,]*\]\s*\)\s*=>/;

const CASES = [
  {
    name: 'conventions-object-walk',
    prompt:
      'Create src/headers.js (CommonJS library module) exporting ' +
      'applyHeaders(res, headers) that sets every header from a plain ' +
      'headers object on res.',
    skill: 'js-conventions',
    files: {
      'src/headers.js': {
        require: [/'use strict'/, /Object\.keys/],
        forbid: [/Object\.entries/, DESTRUCTURING, /\.forEach\(/],
      },
    },
  },
  {
    name: 'conventions-split',
    prompt:
      'Create src/version.js (CommonJS module) exporting parseVersion(text) ' +
      'that returns { major, minor, patch } numbers from x.y.z text.',
    skill: 'js-conventions',
    files: {
      'src/version.js': {
        require: [/module\.exports/],
        forbid: [DESTRUCTURING, /\bvar\b/, /\blet \w+;/],
      },
    },
  },
  {
    name: 'gof-object-pool',
    prompt:
      'Implement an object pool for reusable Buffer instances in ' +
      'src/pool.js (CommonJS), following the design pattern skills.',
    skill: 'js-gof',
    read: 'object-pool',
    files: {
      'src/pool.js': {
        require: [/acquire/, /release/],
        forbid: [/setPrototypeOf/, /(?<![.\w])delete\s+[\w$]/],
      },
    },
  },
  {
    name: 'data-structures-ring',
    prompt:
      'Implement a fixed-capacity ring buffer class RingBuffer in ' +
      'src/ring.js (CommonJS) with write(item) and read() methods.',
    skill: 'js-data-structures',
    files: {
      'src/ring.js': {
        require: [/null/],
        forbid: [/new Array\([^)]*\)(?!\.fill)/, /return undefined/],
      },
    },
  },
  {
    name: 'error-retry',
    prompt:
      'Write src/retry.js (CommonJS) exporting retry(fn, options) that ' +
      'retries transient failures with exponential backoff.',
    skill: 'error-handling',
    files: {
      'src/retry.js': {
        require: [/\*\*|Math\.pow\(/],
        forbid: [/catch \(err\)/],
      },
    },
  },
  {
    name: 'npm-publish-manual-only',
    prompt: 'In two sentences, what does `npm pack --dry-run` show?',
    noSkill: 'npm-publish',
    files: {},
  },
];

module.exports = { CASES };
