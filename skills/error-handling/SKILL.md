---
name: error-handling
description: Apply error handling and recovery patterns in JavaScript/TypeScript or Node.js. Use when implementing error handling, retry logic, or when the user mentions domain errors, error recovery, error escalation.
---

# Error Handling

## Error classification

- Programming errors: Bugs (TypeError, ReferenceError, assertion failures, etc.). Fix the code; do not catch and continue
- Operational errors: Expected failures (network timeout, file not found, invalid input, etc.). Handle gracefully with recovery, escalation, user notification, or logging

## Sync error handling

```javascript
try {
  const result = parse(input);
  return result;
} catch (error) {
  console.error({ error });
  return defaultValue;
}
```

## Async error handling

```javascript
try {
  const data = await fetchData(url);
  return data;
} catch (error) {
  if (error.code === 'ECONNREFUSED') return fallback();
  throw err;
}
```

## DomainError

Structured business errors with codes for the API layer:

```javascript
({
  method: async ({ email }) => {
    const user = await domain.user.findByEmail(email);
    if (!user) return new DomainError('ENOTFOUND');
    return user;
  },
  errors: { ENOTFOUND: 'User not found' },
});
```

Domain layer throws plain errors; API layer translates to DomainError when needed.

## Error propagation across layers

```
domain throws Error → API catches → returns DomainError(code) → client gets structured error
```

Do not expose internal error details to clients; map to known error codes or general errors.

## Conventions

- Distinguish programmer vs operational errors; only recover from operational
- Use DomainError for business validation in API methods; throw for programming bugs
- Never swallow errors silently; always log or propagate
- Implement graceful shutdown: stop accepting connections, drain existing, release resources
- Use retry with exponential backoff for transient failures (network, DB connections)
- Always handle both `uncaughtException` and `unhandledRejection` at process level

## Retry pattern

```javascript
const retry = async (fn, { attempts = 3, delay = 1000 } = {}) => {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === attempts - 1) throw err;
      await new Promise((r) => setTimeout(r, delay * (i + 1)));
    }
  }
};
```

## Process-level handlers

```javascript
process.on('uncaughtException', (error) => {
  console.error('Uncaught:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});
```

Log and exit on uncaughtException (state may be corrupted). Log unhandledRejection and consider it a bug to fix.

## Graceful shutdown

Track connections and drain before exit:

```javascript
const connections = new Map();

server.on('connection', (conn) => {
  const res = null;
  connections.set(conn, res);
  conn.on('close', () => connections.delete(conn));
});

const shutdown = () => {
  server.close(() => {
    freeResources();
    process.exit(0);
  });
  for (const [conn, res] of connections) {
    if (res) res.end('Server shutting down');
    conn.destroy();
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
```
