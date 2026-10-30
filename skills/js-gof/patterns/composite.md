# Composite

Implements a common interface to uniformly handle individual objects and their tree structures, e.g., DOM or file systems.

Refs: https://github.com/HowProgrammingWorks/Composite  
Example: [examples/composite.js](../examples/composite.js)

**Intent** — Treat part and whole with the same operation (sum, render, serialize) via recursion or uniform traversal.

**Problem** — Nested aggregates (menus, folders, JSON) should not need `if (isLeaf)` at every level.

**Applicability** — **Use** for trees and DAGs with shared algorithms (totals, permissions walk). **Avoid** when structure is flat or heterogeneity breaks a clean composite contract.

**JS implementation** — `Array.isArray` vs object values, `reduce` + recursion; JSON trees as in the example. Watch cycles if graphs are not trees.

**Consequences** — Simple client code; deep stacks on huge trees—consider iteration APIs if needed.

**Related patterns** — **Iterator** / `for..of` over flattening; **Decorator** to attach cross-cutting node metadata.
