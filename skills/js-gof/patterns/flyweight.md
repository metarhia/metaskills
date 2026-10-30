# Flyweight

Saves memory allocation by sharing common state among multiple instances.

Refs: https://github.com/HowProgrammingWorks/Flyweight  
Example: [examples/flyweight.js](../examples/flyweight.js)

**Intent** — Split intrinsic (shared, immutable) from extrinsic (per-instance) data so many light “views” point at few shared flyweights.

**Problem** — Huge collections of near-duplicate objects (text, tiles, icons) blow memory if every cell owns a full copy.

**Applicability** — **Use** when intrinsic keys are enumerable and extrinsic state stays outside the flyweight. **Avoid** when sharing breaks identity, mutability, or equality semantics.

**Preconditions** — Intrinsics should be frozen or readonly; extrinsics live on the wrapper object (`row`, `col` in the example).

**JS implementation** — `Map` key -> frozen object; factory `getFlyweight` + small per-use records. See the example.

**Consequences** — Large wins for dense data; key design dominates correctness and eviction policy if needed.

**Related patterns** — **Prototype** if copies are cheap and unshared; **Object pool** recycles throwaway handles, not shared immutable data.
