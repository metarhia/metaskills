# Facade

Simplifies access to a complex system, providing a unified and clear interface, hiding and protecting internal complexity.

Refs: https://github.com/HowProgrammingWorks/Facade  
Example: [examples/facade.js](../examples/facade.js)

**Intent** — One narrow API orchestrates caches, IO, schedulers, or subsystems so feature code stays linear.

**Problem** — Integrations sprawl across many objects with easy-to-get-wrong ordering.

**Applicability** — **Use** at module boundaries and app services. **Avoid** turning the facade into a god object—split by bounded context.

**JS implementation** — Factory returning plain object of async methods (`createApi`); scheduler-style entry points (commented) hide timer/task details.

**Consequences** — Faster feature work; facades need versioning when internals change behavior.

**Related patterns** — Sits over **Adapter**s and **Bridge**s; **Mediators** coordinate events, facades orchestrate calls.
