# Factory Method

Chooses the correct abstraction to create an instance; in JavaScript, this can be implemented using `if`, `switch`, or selection from a collection (dictionary).

Refs: https://github.com/HowProgrammingWorks/FactoryMethod  
Example: [examples/factory-method.js](../examples/factory-method.js)

**Intent** — Let a single entry point decide which concrete type to instantiate based on input or host object.

**Problem** — Subclasses or modules differ only in which product class they construct; you want that decision localized.

**Applicability** — **Use** with static `factory` helpers, creator objects, or registry maps. **Avoid** when a plain import map or strategy object is simpler.

**JS implementation** — `static factory` on a class, or `Creator` object with `factoryMethod`; prefer an object/`Map` registry over a long `switch` when keys are data-driven (`createShape` in the example), and fail loudly on an unknown key.

**Consequences** — Open/closed friendly at the call site; registry needs discipline to avoid a global grab bag.

**Related patterns** — **Strategy** for runtime swap without subclassing; **Factory** for the actual `new` / literal work.
