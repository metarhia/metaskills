# Abstract factory

Creates related objects belonging to one family without specifying their concrete classes, e.g., UI components for different platforms.

Refs: https://github.com/HowProgrammingWorks/AbstractFactory  
Example: [examples/abstract-factory.js](../examples/abstract-factory.js)

**Intent** — Expose one “family” API (e.g. `dataAccess.fs`) so products from that family stay consistent without naming each concrete class at call/instantiation places.

**Problem** — Switching stack (storage, UI kit, rendering method, etc.) should not scatter `new` and coupling logic across the app.

**Constraints** — Each family must implement the same conceptual roles; adding a new _role_ updates every family.

**Applicability** — **Use** when the app switches whole stacks by config or platform. **Avoid** with one family: a plain factory is enough.

**JS implementation** — Plain object or `Map` of factories; dynamic `import/require` or config-driven module wiring.

**Consequences** — Swapping a family is one key; families drift unless a shared contract (`.d.ts`, tests) checks every role.

**Related patterns** — Builds on Factory / Factory Method; often hidden behind a Facade.
