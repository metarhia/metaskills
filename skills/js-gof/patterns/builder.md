# Builder

Step-by-step assembly of a complex configurable object, often using chaining, e.g., Query Builder or Form Generator.

Refs: https://github.com/HowProgrammingWorks/Builder  
Example: [examples/builder.js](../examples/builder.js)

**Intent** — Construct a valid aggregate from many optional steps without huge constructors or flags.

**Problem** — Many valid combinations and order-sensitive steps; you want fluent or declarative assembly and one snapshot at the end.

**Applicability** — **Use** for queries, requests, forms, and other products with many optional parts. **Avoid** when one options object already states everything: pass it to a factory.

**JS implementation** — Chaining returning `this`, `build()` returning an independent snapshot (copy nested state so later steps do not mutate it), or one-shot options object / async init (see comments in example).

**Consequences** — Readable assembly and one validation point in `build()`; a builder that leaks its internal state turns into shared mutable config.

**Related patterns** — Composite for tree-shaped products; Abstract factory when the builder itself is family-specific.
