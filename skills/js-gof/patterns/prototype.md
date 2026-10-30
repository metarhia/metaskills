# Prototype

Creates objects by cloning a prepared instance to save resources (not to be confused with [Prototype-programming](https://github.com/HowProgrammingWorks/Prototype), which is closer to Flyweight).

Refs: https://github.com/HowProgrammingWorks/PrototypePattern  
Example: [examples/prototype.js](../examples/prototype.js)

**Intent** — Duplicate structure quickly from an exemplar instead of replaying construction logic.

**Problem** — Deep graphs or expensive setup should be copied with clear shallow vs deep semantics.

**Applicability** — **Use** when instances are mostly alike or cloning defines correctness (graphics, documents). **Avoid** when identity-sensitive or shared mutable innards must not be duplicated—in those cases prefer **Flyweight** or an explicit graph model; compare with prototype-style programming in the Refs link above.

**Assumptions / invariants** — `clone()` must preserve intended sharing: repeated sub-objects by reference vs independent copies must match domain rules.

**JS implementation** — `{...obj}`, `structuredClone` where suitable, custom `clone()` on classes, or closure factories with captured state. Example covers literal, `Point`/`Line`, and closure style.

**Consequences** — Fast spawning; bugs often come from aliasing shared nested objects unintentionally.

**Related patterns** — **Flyweight** shares immutable intrinsic state; **Composite** trees often clone recursively.
