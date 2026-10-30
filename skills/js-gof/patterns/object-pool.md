# Object Pool

Reuses pre-created objects to save resources during frequent creation and destruction.

Refs: https://github.com/HowProgrammingWorks/Pool  
Example: [examples/object-pool.js](../examples/object-pool.js)

**Intent** — Amortize allocation and teardown by lending instances from a fixed reservoir.

**Problem** — Short-lived heavy objects (buffers, parsers, workers) or GC pressure from churn.

**Applicability** — **Use** under sustained bursty load with resettable objects. **Avoid** when reset is error-prone, objects are cheap, or max concurrency is unbounded without bounds on pool size.

**Preconditions** — `release` must restore a valid blank slate; clients must not steal references after release.

**JS implementation** — Stack/array of instances + `factory` for growth; `acquire` / `release` with a `reset` callback and a size cap, as in the example.

**Consequences** — Predictable memory; risk of stale state if reset is incomplete; cap size to avoid hoarding.

**Related patterns** — **Flyweight** shares immutable data; pool shares **mutable** reusable shells.
