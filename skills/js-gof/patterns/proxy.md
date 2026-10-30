# Proxy

Controls access to an object by intercepting calls, reads, and writes; useful for lazy initialization, caching, and security; can be implemented via GoF or native JavaScript Proxy.

Refs: https://github.com/HowProgrammingWorks/Proxy  
Example: [examples/proxy.js](../examples/proxy.js) (`StatReadStream`)

**Intent** — Add bookkeeping, policy, or alternate dispatch around a target without changing every caller.

**Problem** — Observability, caching, or safety should sit at a stable choke point.

**Applicability** — **Use** GoF-style subclass/wrapper (`StatReadStream`) in hot paths. **Do not** reach for built-in `Proxy` unless asked—engines may deopt (skill default).

**JS implementation** — Extend host class and forward to `super`, keeping its return values (`emit` returns a boolean); re-export the module API with the proxied factory as in the example.

**Consequences** — Centralized behavior; subclassing platform types ties you to their upgrade semantics.

**Related patterns** — **Wrapper** for lighter HOF cases; **Decorator** when stacking domain features.
