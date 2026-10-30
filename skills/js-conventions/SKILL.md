---
name: js-conventions
description: Metarhia JavaScript and TypeScript conventions, project lint setup, formatting, naming, object shape and hidden class rules, named intermediate variables, split-then-compose, contracts, module and export order, ternaries, lookup tables, dynamic dispatch, iteration, async/await, cognitive complexity, performance, and benchmarking. Apply automatically whenever writing, editing, refactoring, simplifying, optimizing, formatting, cleaning up, or reviewing .js, .mjs, .cjs, .ts, or .d.ts files, or when the user asks about code style or linting
---

# JavaScript conventions

Apply on every JavaScript or TypeScript change. Prefer readability unless the
task has a measured reason to do otherwise. See [examples.md](examples.md) to
compare code before and after applying most rules. Read
[performance.md](performance.md) for library or system code (runtimes, parsers,
protocols, I/O) or a measured hot path, and benchmark exceptions on the target
runtime.

## Preparations

- Add these dev dependencies to `package.json` when missing:
  `eslint-config-metarhia`, `eslint`, and `prettier`
- Add these scripts to `package.json` when missing or update to following readable format:

```json
"lint": "eslint . && prettier --check \"**/*.{js,jsx,mjs,cjs,ts,tsx,json,md,mdx,yaml,yml}\"",
"fix": "eslint . --fix && prettier --write \"**/*.{js,jsx,mjs,cjs,ts,tsx,json,md,mdx,yaml,yml}\""
```

The extension list groups JavaScript, TypeScript, data, docs, configs.

- Run `npm t` before and after changing code with ai. Finish only when lint, format,
  and test checks pass
- Run `npm run fix` before fixing remaining lint or format issues by hand
- Preserve the existing module system, source and declaration file types, and
  package layout unless the task asks to change them
- Resolve runtime packages from the registry (or the project's declared source of truth), not from sibling `file:` links in a gitignored lockfile that other machines will not have

## Formatting

For writing new code use single quotes, semicolons, trailing commas in multiline arrays, objects, and parameters, and one blank line between semantic blocks. Keep lines within 80 characters except URLs. Let Prettier and `eslint-config-metarhia` handle spacing, braces, and indentation.

## Naming

- Use `camelCase` for variables and parameters
- Use `UpperCamelCase` for classes and types
- Use `UPPER_SNAKE_CASE` for global constants
- Use `new` only with capitalized constructor names
- Prefer full words for all identifiers (`error`, not `err`). Use a short or
  single-letter name only when a familiar convention makes its meaning clear
  in a small scope, such as `i` and `j` for loop indexes, `x` and `y` for
  coordinates, or `a` and `b` in a short comparator. Otherwise use a name that
  states the role, such as `event`, `index`, or `item`
- Use boolean prefixes: `is`, `has`, `can`, `should`
- Use singular names for entities and plural names for collections
- Use verb names for functions and handlers (`parse`, `create`, `handle`, `on`)
- Include units in numeric names (`timeoutMs`, `sizeBytes`) except options

## How to think

Apply these habits before picking an algorithm, a pattern, or a comment.

- **Data first.** Decide how values sit in memory and relate (string of chars, array or set of tokens, map of aliases, record with a stable object shape, graph, etc). Then write the walk. Do not invent a procedure and then hunt for a structure that fits it
- **Contracts.** Name what the function owns. Inputs are read-only, shared data can be changed just by its owners, unless the contract or tasks requires different approach
- **Name the steps.** Replace nested calls, concatenations, wrapped conditions, and fat object or argument literals with decomposed intermediate named identifiers plus their combinations/compositions/bindings. Each line says what a value _is_. Combine everything to one-line call, a one-line expressions, or a short return if possible
- **Split, then compose.** Break a hard piece into named parts and combine them where the whole reads at once. Isolate semantic complexity (protocol cases, scoring, aliases, special forms) in one table or one function, not in scattered `if`s, and not in a new layer "for Big-O". Computational cost matters in a hot path; unreadability is the default cost to minimize
- **Least accidental complexity.** Identifiers, calls, loops, conditions, expressions and other constructions carry the meaning, comments gives noice in most cases. Among working solutions pick the one with fewer bags, fewer indirections, and no patterns the data does not demand

## Modules

Order in the file and in the export list:

1. imports / requires
2. constants (literals, regexes, maps, lists, loaded assets)
3. functions (`const` arrows; no bare `function`)
4. classes
5. exports (in the order they appear in the file)

- Types go in a sibling `.d.ts`. Never JSDoc
- `'use strict';` only in CommonJS (ES modules are strict already)
- Node builtins always use the `node:` prefix: `require('node:fs')`, not `require('fs')`
- Packages: bare specifier, no extension
- Relative paths always include the extension (`.js` / `.cjs` / `.mjs`); prefer `./dir/moduleName.js` over `./dir`
- Named exports at the bottom (inline `export` only when the project already does that)
- Each import/require is one line. If named bindings would exceed the limit, import the module binding and destructure on the next line. Never a multiline `require()` / `import { ... }`
- One blank line between Node builtins, npm packages, and project modules

```js
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const { asText } = require('./text.js');
const text = require('../utils.js');
const { stripAnsi, visibleWidth, wrapLine, wrapCodeLine, padEndVisible } = text;

const MAX_WIDTH = 80;

const formatValue = (value) => {
  const source = asText(value);
  const plain = stripAnsi(source);
  return padEndVisible(plain, MAX_WIDTH);
};

class Session {}

module.exports = { MAX_WIDTH, formatValue, Session };
```

## Expressions

- Use intermediate identifiers; one expression per line when it fits
- An assignment that wraps only because of length gets a named piece so it fits on one line. A chain that still does not fit becomes separate named steps, never one overlong line
- Use `===` and `!==` only
- Object shorthand: write `{ width }`, not `{ width: wrapWidth }`. Rename the local to match the field (`wrapWidth` to `width`); do not add an alias like `const width = wrapWidth`

```js
// BAD
const renderOptions = {
  width: wrapWidth,
  outputs: outputs,
  tick: tick
};
```

```js
// GOOD
const renderOptions = { width, outputs, tick, hover };
```

## Variables and empty values

- Prefer `const`, minimize `let`, never use `var`
- Every `let` has an initial value of its own type: `''` for strings, `0` or `-1` for numbers, `false` for flags, `null` for objects and other references. Never `let value;`. When every path assigns before the read, bind `const` once instead (a one-line ternary or a function that returns the value)
- An absent value keeps its kind: `null` stands in for an object or other reference (instance, result object, callback, buffer), `undefined` stands in for a scalar (number, string, boolean). Never mix primitives and objects in one variable
- Clear a field by assigning `null` or `undefined` by the same rule; never `delete`
- Hot numeric fields are the one exception: see [performance.md](performance.md)

## Control flow

- A simple `cond ? left : right` is fine on one line. No nested ternaries: use `if` / `else if` / `else`
- A ternary evaluates one side. When expanding it into statements, call or mutate only the taken side; never compute the unused side and overwrite it
- A condition that wraps (`||`, `&&`, a chain of `===`) becomes a named boolean or `LIST.includes(value)`, so the `if` stays one line
- An `if` chain that only picks a value, a list, or a small function is a lookup table: a module-level constant, read by a function that only chooses the key. Flags on the same case become extra keys, chosen before the lookup
- Avoid deep callback nesting
- Call-then-return is `return void fn(...)`. Never `void` with `await`

```js
const onEntry = async (done, isDirectory, entryPath) => {
  if (done) return void finish(null);
  if (isDirectory) {
    await reload(entryPath);
    return;
  }
  await open(entryPath);
};
```

## Functions

- Prefer arrow functions (except class methods). Avoid `arguments`
- Keep functions small and single-purpose; keep return types consistent
- The signature is one line. Keep defaults in the parameter list when it fits (`start(options = {})`); when they would wrap it, drop them and apply `??` on the first lines of the body
- An expression body only for a function that fits on one line. Anything else is a `{ }` block of named steps. Do not wrap a lone `return expr` in a block (`arrow-body-style: as-needed` unwraps it)

**Grain.** A dispatcher (token loop, protocol loop, key/event handler) reads as "what is this case?". Extract the stages a human would look up: span readers returning `{ text, end }`, classifiers, pipelines (`tokenize` then `pack`), lookup tables (`HANDLERS`, `KEY_BINDS`). The loop only combines them.

Do not over-split: no function per short `if` branch, no one-function-per-case split of a sequential event loop, no `context` bag inside a module unless nested helpers already close over many locals. Aim for 40-90 lines per dispatcher and 10-40 per helper. A function that is long because it is a sequential protocol stays long. Do not add a cache, a class, or an indirection to "simplify" what a table already states.

## Classes

- Use a class when state and methods belong together (session, connection, scheduler, state machines, mutual recursion over instance state)
- Instance methods, not `method = () => {}` fields
- Dispatch tables are module-level constants, not `static` fields, unless inheritance needs them
- Event listeners: keep the listener reference and remove it with `off`. Use
  `events.addAbortListener` to connect cleanup to an `AbortSignal`; pass
  `{ signal }` only to APIs that document it. No `.bind(this)` or arrow-field
  methods

## Data

Read the `js-data-structures` skill before choosing a collection or designing
lookup, membership, or alias structures.

**Do not mutate parameters.** Copy when the result must be reordered or filled (`entries.toSorted(byName)`, not `entries.sort(byName)`); mutate only instance fields or a buffer the caller handed over to fill.

**Coercion.** For unknown input: strings pass through, `null` / `undefined` become `''`, anything else `` `${value}` ``. Never `String(...)` or `new String`. Digit width of a number is `` `${count}`.length ``, not the text helper.

**Reuse the library when the result matches.** Call the dependency instead of a local clone (`jsonParse` instead of `try` / `catch` around `JSON.parse`); keep local code when the library differs (sync vs async, UTC vs local time, throw vs null, another fallback).

## Iteration

Choose iteration by data type, code layer, and whether the path is hot:

- Copy: `list.slice()` or `[...list]`; use `toSorted` / `toReversed` / `with` instead of copy-then-mutate. Concat: `a.concat(b)`. Avoid `[...a, ...b]`
- No array destructuring anywhere (assignments, parameters, loops): read by index, `const name = pair[0]`, `const rest = list.slice(1)`. Object destructuring is fine
- Loops depend on the layer:
  - Library and system code (runtimes, parsers, protocols, I/O, hot paths): C-like `for (let i = 0; i < list.length; i++)` over arrays. Dynamic-key collections are `Map`s: `for...of` over `map.values()` or `map.keys()`; `for (const entry of map)` reading `entry[0]` / `entry[1]` only when both are needed. A plain object the code receives (options, headers) is walked with `const keys = Object.keys(obj)` and an index loop
  - Domain and application code: `for...of` over arrays and `Map`, `for...in` over plain data objects, for readability; `Object.values` outside hot paths
  - Both: `for...of` for `Set`, generators, streams, and code points of a string. Never `Object.entries`; never `Object.values` in hot or library code
- Use `.map`, `.filter`, `.reduce` when they state the semantic
- `.forEach` only when "do this for each item" is the semantic and the callback is self-contained. A callback that reads or writes outer variables (accumulators, flags, counters) is a loop instead
- Spread an iterable only when it really is one (`[...set]`, `[...string]` for code points) and `Array.from` does not read better
- Keep escaping allocations out of hot loops: spread, rest, closures created per iteration, and arrays or objects that outlive the call; move reusable callbacks outside loops. Small result objects that do not leave an inlined function (`{ text, end }` from a span reader) are removed by escape analysis and are fine. `try` / `catch` does not deoptimize: place it where the error handling belongs
- For measured allocation concerns and runtime-specific exceptions, read
  [performance.md](performance.md)

```js
// BAD
for (const [key, value] of Object.entries(headers)) res.setHeader(key, value);

// GOOD: domain code, plain data object
for (const name in headers) res.setHeader(name, headers[name]);

// GOOD: library code, dynamic keys live in a Map
for (const name of headers.keys()) {
  const value = headers.get(name);
  res.setHeader(name, value);
}

// GOOD: library code, plain object received from the caller
const names = Object.keys(headers);
for (let i = 0; i < names.length; i++) {
  const name = names[i];
  res.setHeader(name, headers[name]);
}
```

## Object shapes and hidden classes

- A constructor or factory defines the whole object shape. Initialize every
  field once, in the same order, with a stable type so V8 can reuse one hidden
  class. After creation, do not add or delete fields, apply mix-ins, use
  `Object.assign` on an instance, or call `setPrototypeOf`. Only hash-table
  objects may grow and shrink
- Give every instance every field (`null`, `0`, `''`, or `false` when unused).
  Never add a field only to some instances. V8 sizes objects from the first
  instances (slack tracking) and stores later fields outside the object, behind
  an extra indirection
- `delete` and `Object.create(null)` put an object in dictionary mode:
  properties use a hash table, with no hidden-class inline cache or `for...in`
  enumeration cache. This is right for hash-table objects but wrong for
  records. Never delete a record field or build a record or prototype with
  `Object.create(null)`
- Prototypes are set up once at module load and never changed afterwards: no methods added or deleted at runtime (deleting counts as a change), never touch `Object.prototype` or other built-in prototypes. Each change invalidates every cached lookup below it

Library/system code and hot paths also follow [performance.md](performance.md): V8 inline caches, element kinds, numeric fields, module state, `JSON.stringify` fast path, and how to measure.

## Async

- Native promises with `async` / `await`; no promise libraries and no
  hand-written `.then` chains. Awaited call sites appear in async stack traces
- `await` only real promises in hot paths; awaiting a plain value still allocates a wrapper promise

## Docs and comments

- Names and control flow are the documentation. Comment only what identifiers cannot say: why (gotcha, historical bug, "do not simplify"), protocol and magic numbers, empty-`catch` intent (`// ignore`)
- Remove comments that restate the next line, noisy section banners, and `@param` / `@returns` / `@typedef`. Never add comments to mark a style edit
- User-facing help goes in markdown tables (or other structured docs) next to the feature, not in long string literals. Keep it in sync with the real dispatch tables and special cases. Drop redundant aliases in docs and code unless the product intentionally keeps them
