# Decorator

Dynamically extends behavior without inheritance, typically via composition and declarative syntax, effectively adding metadata.

Refs: https://github.com/HowProgrammingWorks/Decorator  
Example: [examples/decorator.js](../examples/decorator.js)

**Intent** — Layer optional behaviors (validation, logging) or metadata around a core object in a composable order.

**Problem** — Subclass explosion for every combination of add-ons.

**Applicability** — **Use** with composition chains, HOFs, `Symbol` keys, or `WeakMap` metadata. **Avoid** TC39-style decorators as the default tool until the project standardizes on them—plain composition is clearer in many JS codebases.

**JS implementation** — Validator objects wrapping a `next` validator (same `validate` contract at every layer), `Symbol` keys for metadata set in the constructor, `WeakMap` for metadata kept outside the object. See the example.

**Consequences** — Flexible order; document pipeline order; watch for double-wrapped side effects.

**Related patterns** — **Wrapper** for functions; **Chain of responsibility** when each link can stop processing.
