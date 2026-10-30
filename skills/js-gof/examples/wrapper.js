'use strict';

const withLogging =
  (fn, label) =>
  (...args) => {
    console.log(`${label} called`, args);
    const result = fn(...args);
    console.log(`${label} returned`, result);
    return result;
  };

const wrapInterface = (anInterface, wrap) => {
  const wrapped = {};
  for (const key in anInterface) {
    const value = anInterface[key];
    const isMethod = typeof value === 'function';
    wrapped[key] = isMethod ? wrap(value, key) : value;
  }
  return wrapped;
};

// Usage: const loggedFs = wrapInterface(fs, withLogging);

class Timeout {
  constructor(fn, msec) {
    this.fn = fn;
    this.timer = setTimeout(() => {
      this.timer = null;
    }, msec);
  }

  execute(...args) {
    if (!this.timer) return null;
    clearTimeout(this.timer);
    this.timer = null;
    return this.fn(...args);
  }
}

module.exports = { withLogging, wrapInterface, Timeout };
