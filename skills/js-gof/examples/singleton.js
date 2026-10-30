'use strict';

// Preferred: module cache makes module-level state a singleton on import
const connections = new Map();

// Class with a private static instance
class Singleton {
  static #instance = null;

  constructor() {
    const instance = Singleton.#instance;
    if (instance) return instance;
    Singleton.#instance = this;
  }
}

// Closure holds the instance; the class stays private
const SingletonClosure = (() => {
  let instance = null;

  class Single {
    constructor() {
      if (instance) return instance;
      instance = this;
    }
  }

  return Single;
})();

// Accessor function instead of a constructor
const getInstance = (() => {
  const instance = {};
  return () => instance;
})();

module.exports = { connections, Singleton, SingletonClosure, getInstance };
