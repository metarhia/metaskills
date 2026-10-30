---
name: js-gof
description: Apply creational and structural design patterns (GoF and related) in JavaScript and TypeScript: abstract factory, builder, factory, factory method, prototype, flyweight, singleton, object pool, adapter, wrapper, boxing / value object, decorator, proxy, bridge, composite, facade, context. Use when implementing, choosing, explaining, or reviewing one of these patterns, or when the user names one.
---

# GoF Patterns

- Use structural composition over inheritance
- Use multiparadigm code and contract-programming
- Use domain-specific languages (DSLs), prefer declarative way
- Separate and do not mix system and domain code
- Use GRASP and SOLID principles; especially reduce coupling
- Remember about referential transparency
- Prefer platform-agnostic code
- Implement isolation and layer borders with IoC & DI
- Use object/Map lookup for Strategy and polymorphic/dynamic dispatch
- Keep patterns simple
- Do not over-engineer for the sake of the pattern name

## How to use

Pick the pattern from the lists, then read its pattern file (intent, problem, applicability, JS implementation, consequences, related patterns) and its example before implementing, explaining, or reviewing it. Follow the example's naming, structure, and idioms; domain names (`User`, `IoTDevice`) are placeholders. Read only the patterns the task needs.

## Creational patterns

- **Abstract factory**: Switch a whole family of related objects (storage, UI kit) by one key. Read [patterns/abstract-factory.md](patterns/abstract-factory.md) and [examples/abstract-factory.js](examples/abstract-factory.js)
- **Builder**: Assemble a complex product from many optional, order-sensitive steps. Read [patterns/builder.md](patterns/builder.md) and [examples/builder.js](examples/builder.js)
- **Factory**: Centralize object creation: defaults, validation, and one final
  object shape. Read [patterns/factory.md](patterns/factory.md) and
  [examples/factory.js](examples/factory.js)
- **Factory Method**: Pick the concrete class from input through a registry. Read [patterns/factory-method.md](patterns/factory-method.md) and [examples/factory-method.js](examples/factory-method.js)
- **Prototype**: Clone a prepared instance instead of rebuilding it. Read [patterns/prototype.md](patterns/prototype.md) and [examples/prototype.js](examples/prototype.js)
- **Flyweight**: Share immutable intrinsic state among many small objects. Read [patterns/flyweight.md](patterns/flyweight.md) and [examples/flyweight.js](examples/flyweight.js)
- **Singleton**: One shared instance; prefer module state, context, or DI. Read [patterns/singleton.md](patterns/singleton.md) and [examples/singleton.js](examples/singleton.js)
- **Object Pool**: Reuse expensive objects under bursty load. Read [patterns/object-pool.md](patterns/object-pool.md) and [examples/object-pool.js](examples/object-pool.js)

## Structural patterns

- **Adapter**: Make a foreign interface match the one your code expects. Read [patterns/adapter.md](patterns/adapter.md) and [examples/adapter.js](examples/adapter.js)
- **Wrapper**: Add cross-cutting behavior around a function or interface. Read [patterns/wrapper.md](patterns/wrapper.md) and [examples/wrapper.js](examples/wrapper.js)
- **Boxing**: Give a primitive a validated domain type (value object). Read [patterns/boxing.md](patterns/boxing.md) and [examples/boxing.js](examples/boxing.js)
- **Decorator**: Layer optional behavior or metadata without subclassing. Read [patterns/decorator.md](patterns/decorator.md) and [examples/decorator.js](examples/decorator.js)
- **Proxy**: Control access to an object (stats, cache, policy) without built-in `Proxy`. Read [patterns/proxy.md](patterns/proxy.md) and [examples/proxy.js](examples/proxy.js)
- **Bridge**: Let two hierarchies (features, implementations) vary independently. Read [patterns/bridge.md](patterns/bridge.md) and [examples/bridge.js](examples/bridge.js)
- **Composite**: Treat leaves and trees through one operation. Read [patterns/composite.md](patterns/composite.md) and [examples/composite.js](examples/composite.js)
- **Facade**: One narrow API over a complex subsystem. Read [patterns/facade.md](patterns/facade.md) and [examples/facade.js](examples/facade.js)
- **Context**: Pass capabilities and request state between layers without globals. Read [patterns/context.md](patterns/context.md) and [examples/context.js](examples/context.js)
