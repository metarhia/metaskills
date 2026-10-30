# Wrapper

Function wrapper that delegates calls and adds behavior; a specialized case of Adapter.

Refs: https://github.com/HowProgrammingWorks/Wrapper  
Example: [examples/wrapper.js](../examples/wrapper.js)

**Intent** — Observe, throttle, or guard an existing callable without editing its body.

**Problem** — Cross-cutting concerns (logging, timeouts, metrics) should not duplicate inside every function.

**Applicability** — **Use** for HOF wrappers and interface-wide delegation. **Avoid** deep wrapper stacks that obscure control flow—compose middleware-style with clear order.

**JS implementation** — `withLogging`, per-key wrapping of an object’s methods (`wrapInterface`), time-bounded execution like `Timeout`. Forward all arguments and return the result.

**Consequences** — Readable composition; watch argument/`this` forwarding and async propagation.

**Related patterns** — **Decorator** stacks behavior on domain objects; **Proxy** (GoF) for heavier interception.
