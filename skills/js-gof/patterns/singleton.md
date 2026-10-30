# Singleton

Provides global access to a single instance; often considered an anti-pattern, easiest implemented via ESM/CJS module caching exported refs.

Refs: https://github.com/HowProgrammingWorks/Singleton  
Example: [examples/singleton.js](../examples/singleton.js)

**Intent** — Guarantee one shared coordinator or state bag for the process (or module graph).

**Problem** — Multiple instances would break coordination (rate limits, connection pool, legacy APIs).

**Applicability** — **Use** sparingly: module-scope maps, log sinks, true OS-level single resources. **Avoid** for testability and parallel contexts—prefer explicit parameters, context, or DI.

**JS implementation** — Prefer **module exports** (natural singleton in Node/ESM) over clever `IIFE` constructors unless legacy requires them. Example shows module state first, then class and closure variants with `null`-initialized instance.

**Consequences** — Simple wiring; hides dependencies and complicates tests and hot reload unless you inject abstractions.

**Related patterns** — **Context** / explicit props replace hidden singletons; **Multiton** if you need one per key.
