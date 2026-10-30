# Boxing

Wraps primitives into object types to add methods or unify interfaces, e.g., narrowing `String` to `AddressString`.

Refs: https://github.com/HowProgrammingWorks/ADT  
Example: [examples/boxing.js](../examples/boxing.js) (`AddressString`, `SpeedValue`)

**Intent** — Give primitive or plain data a typed contract, invariants, and helpful methods so invalid states do not spread.

**Problem** — Raw strings/numbers encode domain meaning; validation and operations scatter at every call site.

**Applicability** — **Use** for domain nouns (money, email, units). **Avoid** boxing every string—cost is ergonomics and serialization boundaries.

**Invariants** — Constructor enforces validity; `valueOf` / `toString` keep interop with APIs expecting primitives where safe.

**JS implementation** — Private fields + getters; unit normalization as in `SpeedValue`. See the example.

**Consequences** — Safer APIs; map cleanly to validation layers and **Decorator** / **Composite** boundaries.

**Related patterns** — Value objects pair with **Factory** for parsing; **Adapter** when bridging to external stringly APIs.
