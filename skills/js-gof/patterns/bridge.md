# Bridge

Separates two or more abstraction hierarchies via composition or aggregation, allowing them to evolve independently.

Refs: https://github.com/HowProgrammingWorks/Bridge  
Example: [examples/bridge.js](../examples/bridge.js)

**Intent** — Let feature hierarchy (devices) vary separately from implementation hierarchy (protocols).

**Problem** — Cartesian product of `SmartLight×MQTT`, `SmartLight×HTTP`, … explodes without composition.

**Applicability** — **Use** when both dimensions change often. **Avoid** when one dimension is fixed one-off—a single injected strategy is enough.

**Participants / collaboration** — Device holds `protocol`; operations delegate `sendCommand(name, payload)` without knowing transport details.

**JS implementation** — Inject protocol instance via constructor; subclasses call `operate` / `sendCommand`. See IoT example.

**Consequences** — Two small hierarchies instead of one wide one; wiring happens at composition root (app/bootstrap).

**Related patterns** — **Strategy** is the degenerate bridge (one abstraction); **Adapter** if protocol interface is foreign.
