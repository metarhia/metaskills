---
name: js-style
description: JavaScript and TypeScript structure, readability, cognitive complexity, flexibility and performance style: object shapes, named intermediate variables (identifiers), split-then-compose, contracts, module and export order, ternaries, lookup and dynamic dispatch. Apply automatically whenever writing, editing, refactoring, simplifying, optimizing, or reviewing .js, .mjs, .cjs, .ts, or .d.ts including code simplification, cleanup and refactoring
---

# JS style

Apply these conventions on every JavaScript change unless the project already documents a conflicting convention. Do not change ESLint/Prettier config or commit unless asked.

Do not convert cjs and esm unless asked. Do not convert js, ts, .d.ts unless asked. Mechanical style (quotes, semis, `max-len`, nested ternaries, `prefer-template`, `object-shorthand`, `strict`, arrow parens, and the rest) comes from the project's linters config.

Run the project's linters, tests both before starting changes and after finishing them. Fix every reported lint/format issue and every failing test before considering the work done. Use the project's usual scripts (for example `npm run lint`, `npm test`) when they exist.

Resolve runtime packages from the registry (or the project's declared source of truth). Avoid relying on sibling `file:` links in a gitignored lockfile that other machines will not have.

## How to think

These habits are the style. Apply them on every write and review, before picking an algorithm, a pattern, or a comment.

**Data first.** Decide how values sit in memory and how they relate (string of chars, array of tokens, map of aliases, object with a stable shape, graph of owned instances). Then write the walk. Do not invent a procedure and then hunt for a structure that fits.

**Contracts.** Name what the function owns. Inputs are read-only unless the contract is "fill this object / this buffer". Do not mutate caller data for convenience. Shared tables stay immutable; mutation lives at the edge or on a clearly owned instance.

**Name the steps.** Replace nested calls, concatenations, wrapped conditions, and fat object or argument literals with intermediate bindings. A line should say what a value _is_. Combine those bindings in one place: a one-line call, a one-line object, or a short return.

**Split, then compose.** Break a hard piece into named parts. Combine those parts in one place that reads as the whole. Isolate semantic complexity (protocol cases, scoring, aliases, special forms) in a table or one function — not scattered `if`s, and not a new layer "for Big-O". Computational cost matters in a measured hot path; unreadability is the default cost to minimize.

**Readable control, not comments.** Identifiers and `if` / `else` carry the meaning. Comments only for why, gotchas, protocol, empty `catch`. Among working solutions, pick the one with less accidental complexity: fewer bags, fewer indirections, fewer patterns the data does not demand.

## Modules

Order in the file and in the export list:

1. imports / requires
2. constants (literals, regexes, maps, lists, loaded assets)
3. functions (`const` arrows; no bare `function`)
4. classes
5. exports (constants, then functions, then classes)

Put types in a sibling `.d.ts`. Avoid JSDoc.

Import and export rules (CommonJS and ES modules):

- `'use strict';` only for CommonJS (ES modules are strict by default)
- Node builtins: always use the `node:` prefix
- Packages: bare specifier, no extension
- Relative paths: always include the extension (`.js` / `.cjs` / `.mjs`). Prefer `./dir/index.js` over `./dir`
- Named exports at the bottom (or inline `export` only when the project already does that)
- Keep each import/require on one line. If named bindings would exceed the line limit, import/require the module binding, then destructure on the next line. Never multiline `require()` / `import { ... }` destructuring
- One blank line between Node builtins, npm packages, and project modules

```js
// BAD
const fs = require('fs');
import path from 'path';

// GOOD
const fs = require('node:fs');
import path from 'node:path';
```

CommonJS example:

```js
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const { asText } = require('./text.js');
const text = require('../utils.js');
const { stripAnsi, visibleWidth, wrapLine, wrapCodeLine, padEndVisible } = text;

const MAX_WIDTH = 80;

const formatValue = (value) => asText(value);

class Session {}

module.exports = { MAX_WIDTH, formatValue, Session };
```

ES module example:

```js
import fs from 'node:fs';
import path from 'node:path';

import { asText } from './text.js';
import * as text from '../utils.js';
const { stripAnsi, visibleWidth, wrapLine, wrapCodeLine, padEndVisible } = text;

const MAX_WIDTH = 80;

const formatValue = (value) => asText(value);

class Session {}

export { MAX_WIDTH, formatValue, Session };
```

## Expressions and control flow

- Use intermediate identifiers
- Prefer one expression per line when it still fits
- Object shorthand: when the property name matches the local identifier, write `{ width }` not `{ width: wrapWidth }`. Rename the local to match the field when that keeps the call site clear (do not just create aliases like in example: `const width = wrapWidth`, rename `wrapWidth` to `width`)

```js
// BAD
return !items.length
  ? ''
  : items
      .filter((entry) => entry.ok)
      .map((entry) =>
        entry.selected
          ? chrome.selected(
              ' › ' + (entry.isDir ? `${entry.name}/` : entry.name),
            )
          : (entry.isDir ? chrome.dir : chrome.file)(
              '   ' + (entry.isDir ? `${entry.name}/` : entry.name),
            ),
      )
      .join('\n');

// GOOD
if (!items.length) return '';
const visible = items.filter((entry) => entry.ok);
const lines = visible.map((entry) => {
  const label = entry.isDir ? `${entry.name}/` : entry.name;
  if (entry.selected) return chrome.selected(` › ${label}`);
  const styled = entry.isDir ? chrome.dir(label) : chrome.file(label);
  return `   ${styled}`;
});
return lines.join('\n');
```

```js
// BAD
const renderOptions = { width: wrapWidth, outputs: outputs, tick: tick };

// GOOD
const renderOptions = { width, outputs, tick, hover };
```

- Simple `cond ? left : right` is fine if it fits on one line
- No nested ternaries. Use `if` / `else if` / `else`
- A condition that wraps across lines (`||`, `&&`, or a chain of `===`) becomes a named boolean or `list.includes(value)`. The `if` stays one line
- A ternary evaluates one side. When you expand it into statements, call or mutate only the taken side. Do not compute the unused side and then overwrite it
- An `if` chain that only picks a value, a list, or a small function is a lookup table. Put the table in a module-level constant. The function chooses a key, then reads the table. Flags on the same case are extra keys, chosen before the lookup
- An assignment whose initializer wraps only because of length gets a named piece so the assignment is one line. Leave a chain that still does not fit as separate named steps, not one overlong line
- Every `let` has an initializer, and a path must be able to keep that value. Do not write `let value;`. Absent objects, results, and callbacks stay `null`. Counts and indexes stay `0`. Flags stay `false`. Text stays `''`. When every path assigns before the value is read, bind `const` once (a one-line ternary, or a function that returns the value) instead of pre-assigning a `let`
- Call-then-return: `return void functionName(...)`
- Never `void` with `await`

```js
if (done) return void finish(null);

if (isDirectory) {
  await reload(dirPath);
  return;
}
```

## Functions and classes

- The signature is one line. If defaults would wrap it, drop them from the parameter list and apply `??` on the first lines of the body. Prefer defaults in the parameter list when the whole signature still fits. Example: `start(options = {})`
- An expression body is only for a function that is one line within the line limit
- Anything else uses `{ }` with named steps. `arrow-body-style: as-needed` unwraps a block that is only `return expr`, so do not wrap a single return. Name the pieces, then return them

```js
// GOOD
const renderFrame = (lang, source, options = {}) => {
  const width = options.width ?? 80;
  const setup = options.setup ?? false;
  // function body
};

// GOOD: keep one-line signature; default the bag in the body
const renderFrame = (lang, source, theme, outputs, hover, options) => {
  const opts = options ?? {};
  const width = opts.width ?? 80;
  const setup = opts.setup ?? false;
  // function body
};
```

Grain: a dispatcher (token loop, protocol loop, key/event handler) should read as "what is this case?". Extract named stages a human would look up: span readers `{ text, end }`, classifiers, pipelines (`tokenize` then `pack`), lookup tables (`HANDLERS`, `KEY_BINDS`). That is split-then-compose: hard meaning lives in one table or one helper; the loop only combines.

Do not extract every short `if` branch, split a sequential event loop into one function per case, or introduce a `context` bag unless nested helpers already close over many locals. Target roughly 40-90 lines for a dispatcher; helpers 10-40. If a function is long because it is a sequential protocol, leave it. Do not add a cache, a class, or an indirection to "simplify" what a table already states.

Use a class when state and methods belong together (sessions, machines, mutual recursion with instance state). Prefer instance methods, not `methodName = () => {}` fields.

- Dispatch tables live as module-level constants, not `static` fields, unless inheritance needs them
- Event listeners: pass an inline arrow at registration that calls the method. Detach with `AbortController` / `{ signal }`. Do not rebind with `.bind(this)` or replace the method with an arrow field

```js
this.abortController = new AbortController();
const { signal } = this.abortController;
process.on('SIGINT', () => this.onSignal(), { signal });
stream.on('data', (chunk) => this.onData(chunk), { signal });
// cleanup: this.abortController.abort();
```

## Data

Shape first, then the walk. Pick the smallest structure that matches how the values actually relate:

- Distinct values / actions: `{ key: value }`
- Multi-token membership: array + `.includes()`
- Single-char membership (same role): string + `.includes(ch)`

Do not use `{ token: true, other: true }` for membership: that is a set of keys with dummy values; use a string (chars) or an array (tokens).

One source of truth. Put aliases / synonyms in one map; export small helpers (`mapAlias`, `isKind`) instead of copying lists across modules. Derive lists from maps when possible (`Object.keys(LABELS)`). Reuse a shared map for overlapping subsets instead of duplicating keys. Normalize aliases at the edge (`alias` to `canonical`) instead of registering every alias in every table.

Do not mutate parameters. Copy if the result must be reordered or filled; mutate only instance fields or a buffer the caller handed over to be filled.

```js
// BAD: sort in place, caller loses original order
const rank = (entries) => {
  entries.sort((a, b) => a.name.localeCompare(b.name));
  return entries;
};

// GOOD: own the array you reorder
const rank = (entries) => {
  const ranked = [...entries];
  ranked.sort((a, b) => a.name.localeCompare(b.name));
  return ranked;
};
```

Score / style tables keep real values in objects; membership-only char groups stay strings:

```js
const BREAK_AFTER = ',;{([=?:+-*/%&|^<>!';
const EARLY_SCORE = { ',': 100, ';': 100, ' ': 70 };

if (EARLY_SCORE[prev] !== undefined) return EARLY_SCORE[prev];
if (BREAK_AFTER.includes(prev) && !isIdent(cur)) return 55;
```

Coercion:

- Unknown input: string passthrough, `null`/`undefined` becomes `''`, else `` `${value}` ``. Never `String(...)` or `new String`
- Digit width of a number: `` `${count}`.length ``, not the text helper
- `Set` only when you mutate or need uniqueness of computed values, not for static keyword lists
- `Map` only when you add and delete keys, or when keys are not strings. A fixed string-key table is a plain object. Build it with `Object.fromEntries` when the pairs come from another list
- If a dependency already returns the same result, call it. Do not keep a local clone (`try` / `catch` around `JSON.parse` when `jsonParse` already returns null, `typeof === 'object'` plus `Array.isArray` when `isHashObject` already says that). Do not switch when the library changes the result: sync versus async, UTC versus local time, throw versus null, or a different fallback

## Docs and comments

Prefer markdown tables (or other structured docs) co-located with the feature for user-facing help, rather than long string literals in code. Keep docs in sync with the real dispatch tables and special-case handlers. Drop redundant aliases in docs and code unless the product intentionally keeps them.

Names and control flow are the documentation. Keep only comments that add information the identifiers do not: why (gotcha, historical bug, "do not simplify"), protocol / magic numbers, empty-catch intent (`// ignore`). Remove comments that restate the next line, noisy section banners, and redundant `@param` / `@returns` when types live elsewhere.

Do not add comments to mark a style edit. The names are the record of the change.
