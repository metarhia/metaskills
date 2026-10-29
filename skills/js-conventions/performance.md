# Performance and V8

Rules for library/system code and measured hot paths, on top of
[SKILL.md](SKILL.md). They target current Node.js and V8 releases. Outside
measured hot code, readability wins.

## Object shapes, hidden classes, and inline caches

- Objects with the same properties added in the same order can share a V8 hidden
  class, also called an object shape. A hot property read or call site handles
up to four hidden classes before it becomes megamorphic. In hot paths, use
  one class with a `kind` field instead of many subclasses. If subclasses stay,
  declare every field in the base constructor in the same order
- Keep hot functions monomorphic with stable argument and return types
- Choose public fields, private fields and methods, or constructor assignments
  by design, not an assumed speed difference. Fields use define semantics:
  they do not call setters
- Prefer string or number literals for status and codes

## Numbers

- Hot numeric fields: initialize and reset them with a number (`0`, or `-1` as the absent sentinel), never `undefined` or `null`. A field that starts non-numeric becomes a generic tagged field and boxes every double write. Do not use `NaN` as a sentinel: it belongs to native APIs that return it instead of throwing

## Arrays

- Arrays have one element kind and no holes. Element kinds tend to generalize
  (integer -> double -> any, packed -> holey), so do not rely on them narrowing
  again. Build with a literal, `push`, `Array.from({ length }, fn)`, or
  `new Array(n).fill(value)`; never leave `new Array(n)` unfilled, write past
  `length`, or grow by setting `length`; do not mix integers, doubles, and
  objects in one array
- Integer arrays stay integer: normalize `-0` to `0` and reject `NaN` and `Infinity` before storing; one such value turns the whole array into doubles
- Never read past the end: `i < list.length`, never `i <= list.length`, never
  `while ((item = list[i]) !== undefined)`. An out-of-bounds read may walk the
  prototype chain and disrupt optimization
- Never `Object.defineProperty` on array indices: one non-default element moves the whole array to slow elements

## Memory and module state

- Module state: module-level tables and settings are `const` and never reassigned (optimized code embeds them and deoptimizes when they change). A mutable module-level counter holds only integers, so V8 updates it in place without allocation
- Buffers, queues, and pools set a consumed slot to `null` so the GC can free the item
- Reduce GC pressure: reuse arrays, objects, and buffers when safe

## Serialization

- `JSON.stringify` fast path for data serialized often: no `replacer` or `space` argument (transform first), no `toJSON`, no numeric-like keys (`'0'`), no symbol keys or non-enumerable properties, keys without `"` or `\`, and arrays of objects with the same hidden class

## Iteration costs

Use the iteration rules in [SKILL.md](SKILL.md) as defaults, then benchmark the
current target runtime when iteration matters:

- Prefer `for i` for array iteration in library code, system code, and hot paths
- Use `for...of` for arrays and other iterables in domain code and non-hot paths
- Use `for...in` for plain objects in domain code. In library code and hot paths, use `Object.keys` with an indexed loop
- Avoid `.forEach`; it is usually the slowest direct array traversal. Use a
  loop for side effects or state changes
- Use pure `.reduce` for reductions; current engines optimize it well
- Avoid `Object.entries` and `Map` entry iteration. For `Map`, iterate
  `keys()` or `values()`. If both are needed, iterate keys and call `map.get`
- Use `slice()` or `[...list]` for an array copy and `concat()` for an array join; avoid `[...a, ...b]`

## Measuring

- Profile the real hot path before applying micro-rules; outside measured hot code, readability wins
- Shapes and arrays: `node --allow-natives-syntax` with `%HasFastProperties`, `%HasHoleyElements`, `%HaveSameMap`. Deopts and field changes: `--trace-opt`, `--trace-deopt`, `--trace-generalization`. Checks only, never in committed code
- Micro-benchmarks: one case per process (a shared harness makes its call site megamorphic and skews every case after the first), warm up before timing, accumulate results into a printed sink so the work is not eliminated, and take the median of several runs

## Primary sources

- [Node.js documentation](https://nodejs.org/api/)
- [V8 fast properties](https://v8.dev/blog/fast-properties)
- [V8 elements kinds](https://v8.dev/blog/elements-kinds)
- [V8 spread elements](https://v8.dev/blog/spread-elements)
- [V8 JSON serialization](https://v8.dev/blog/json-stringify)
