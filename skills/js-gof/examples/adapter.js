'use strict';

const promisify =
  (fn) =>
  (...args) =>
    new Promise((resolve, reject) => {
      fn(...args, (err, data) => (err ? reject(err) : resolve(data)));
    });

// Timer with [Symbol.asyncIterator] — illustrative contract
// const timer = new Timer(1000);
// for await (const step of timer) {
//   console.log({ step });
// }

class ArrayToQueueAdapter {
  #array = null;

  constructor(array) {
    if (!Array.isArray(array)) {
      throw new Error('Array instance expected');
    }
    this.#array = array;
  }

  enqueue(data) {
    this.#array.push(data);
  }

  dequeue() {
    return this.#array.shift();
  }

  get count() {
    return this.#array.length;
  }
}

module.exports = { promisify, ArrayToQueueAdapter };
