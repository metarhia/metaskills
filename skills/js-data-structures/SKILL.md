---
name: js-data-structures
description: Implement and use data structures in JavaScript. Use when working with arrays, sets, maps, other collections, queues, lists, trees, graphs, circular buffers, caches, or when the user mentions data structures, BTree, or choosing between Map/Object/Set/Array.
---

# Data Structures (JavaScript)

## Map vs Object, Set vs Array

- Prefer **Map** when keys are non-string (numbers, objects), when you add/remove entries often, when you need `.size`
- Prefer **Object** when keys are string/symbol, the shape is static and known at creation, or you need JSON serialization
- Prefer **Set** when uniqueness matters or you need fast `.has()` lookups
- Prefer **Array** when order and duplicates matter; when have fixed size array; need index access

## Linked List

Single-linked list:

```javascript
class LinkedList {
  #head = null;
  #length = 0;

  push(data) {
    this.#head = { data, next: this.#head };
    this.#length++;
  }

  pop() {
    if (!this.#head) return undefined;
    const { data } = this.#head;
    this.#head = this.#head.next;
    this.#length--;
    return data;
  }

  *[Symbol.iterator]() {
    let node = this.#head;
    while (node) {
      yield node.data;
      node = node.next;
    }
  }
}
```

## Queue

Basic queue with array:

```javascript
class Queue {
  #buffer = [];
  enqueue(item) {
    this.#buffer.push(item);
  }
  dequeue() {
    return this.#buffer.shift();
  }
  get length() {
    return this.#buffer.length;
  }
}
```

V8-optimized queue uses unrolled linked nodes with fixed-size buffers to avoid `shift()` O(n) cost:

```javascript
class Node {
  constructor(size) {
    this.buffer = new Array(size);
    this.readIdx = 0;
    this.writeIdx = 0;
    this.next = null;
  }
  enqueue(item) {
    if (this.writeIdx >= this.buffer.length) return false;
    this.buffer[this.writeIdx++] = item;
    return true;
  }
  dequeue() {
    if (this.readIdx >= this.writeIdx) return undefined;
    return this.buffer[this.readIdx++];
  }
}
```

## Circular Buffer

```javascript
class CircularBuffer {
  #buffer;
  #size;
  #readIdx = 0;
  #writeIdx = 0;

  constructor(size) {
    this.#size = size;
    this.#buffer = new Array(size);
  }

  write(item) {
    this.#buffer[this.#writeIdx] = item;
    this.#writeIdx = (this.#writeIdx + 1) % this.#size;
  }

  read() {
    const item = this.#buffer[this.#readIdx];
    this.#readIdx = (this.#readIdx + 1) % this.#size;
    return item;
  }
}
```

## Binary Search Tree

```javascript
class BST {
  constructor(data) {
    this.data = data;
    this.left = null;
    this.right = null;
  }

  insert(data) {
    if (data < this.data) {
      if (this.left) this.left.insert(data);
      else this.left = new BST(data);
    } else {
      if (this.right) this.right.insert(data);
      else this.right = new BST(data);
    }
  }
}
```
