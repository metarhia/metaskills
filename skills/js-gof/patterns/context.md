# Context

Exchanges state and dependencies between different components (abstractions, modules, layers) that do not share a common environment, without tightly coupling them.

Refs: https://github.com/HowProgrammingWorks/Context  
Example: [examples/context.js](../examples/context.js)

**Intent** — Pass capabilities (`console`, policy, `user`) as one bag or closure capture so services stay testable and environment-agnostic.

**Problem** — Global singletons or deep parameter lists for cross-cutting capabilities.

**Applicability** — **Use** per request/job in servers, CLI, or tests with fake context. **Avoid** mutable mega-context that becomes an untyped service locator—keep fields explicit.

**JS implementation** — Object map injected into constructors or factory that closes over destructured context fields.

**Consequences** — Replaces hidden singletons; document required keys; optional chaining does not replace explicit contracts in domain code.

**Related patterns** — **Dependency injection** without a framework; **Strategy** objects can live on the context; replaces **Singleton** for test doubles.
