'use strict';

class Pool {
  #available = [];
  #factory = null;
  #reset = null;
  #size = 0;

  constructor(factory, reset, size) {
    this.#factory = factory;
    this.#reset = reset;
    this.#size = size;
    for (let i = 0; i < size; i++) this.#available.push(factory());
  }

  acquire() {
    return this.#available.pop() ?? this.#factory();
  }

  release(obj) {
    if (this.#available.length >= this.#size) return;
    this.#reset(obj);
    this.#available.push(obj);
  }
}

// Usage:
// const buffers = new Pool(() => Buffer.alloc(4096), (b) => b.fill(0), 16);
// const buffer = buffers.acquire();
// buffers.release(buffer);

module.exports = { Pool };
