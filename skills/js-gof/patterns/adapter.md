# Adapter

Converts an incompatible interface into a compatible one, enabling third-party component usage without altering its code; can even transform a function contract into an object or vice versa.

Refs: https://github.com/HowProgrammingWorks/Adapter  
Example: [examples/adapter.js](../examples/adapter.js)

**Intent** — Make something you cannot change speak the protocol your code expects (sync->async, callback->Promise, array->queue).

**Problem** — Vendor API, legacy callback, or shape mismatch blocks composition without rewriting upstream.

**Applicability** — **Use** at boundaries (infra, old modules). **Avoid** smearing adapters everywhere—sometimes fork or wrap once at import.

**JS implementation** — Higher-order `promisify`, thin classes delegating to existing structures (`ArrayToQueueAdapter`). Iterator/async-iterator adapters are common (see commented timer sketch).

**Consequences** — Isolation of ugliness; a thin layer can still leak if error shapes differ—normalize them deliberately.

**Related patterns** — **Wrapper** when you add behavior; **Facade** when you simplify many adapters behind one face.
