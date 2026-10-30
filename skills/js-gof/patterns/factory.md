# Factory

Function or method that creates objects in different ways: literals with
methods, class instances, or `Object.create(proto)` with a shared prototype.
The factory sets the whole object shape. It does not change after the factory
returns: no mix-ins or `setPrototypeOf`.

Refs: https://github.com/HowProgrammingWorks/Factory  
Example: [examples/factory.js](../examples/factory.js)

**Intent** — Centralize object birth so construction rules, defaults, and polymorphism stay in one place.

**Problem** — Call sites should not embed `new`, branching, or wiring every
time the object shape changes.

**Applicability** — **Use** for parametrized records, pooled or indexed instances, and objects sharing one prototype. **Avoid** when a single `class` + `new` is obvious and stable.

**JS implementation** — Arrow factories, closures holding counters or config, small pure functions returning object literals. See `createUser` / connection factory in the example.

**Consequences** — Flexible and testable; overuse scatters unless factories are named and grouped by domain module.

**Related patterns** — **Factory Method** picks type; **Abstract factory** groups families; **Prototype** when clone is cheaper than rebuild.
