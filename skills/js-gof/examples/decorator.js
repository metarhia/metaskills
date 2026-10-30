'use strict';

// Symbol key for metadata: invisible to JSON and Object.keys
const META = Symbol('meta');

// Innermost link: accepts everything, so every layer can call `next`
const PASS = { validate: () => true };

// Each decorator adds one check and delegates to the wrapped validator
class RequiredValidator {
  constructor(next = PASS) {
    this.next = next;
  }

  validate(value) {
    return value !== '' && this.next.validate(value);
  }
}

class EmailValidator {
  constructor(next = PASS) {
    this.next = next;
    this[META] = { type: 'email', label: 'Email field' };
  }

  validate(value) {
    return value.includes('@') && this.next.validate(value);
  }
}

class MinLengthValidator {
  constructor(next, min) {
    this.next = next;
    this.min = min;
  }

  validate(value) {
    return value.length >= this.min && this.next.validate(value);
  }
}

const required = new RequiredValidator();
const email = new EmailValidator(required);
const validator = new MinLengthValidator(email, 6);
const valid = validator.validate('user@example.com');

// Metadata outside the instance: module-local WeakMap, no object changes
const metadata = new WeakMap();
const describe = (instance, meta) => void metadata.set(instance, meta);
const getMeta = (instance) => metadata.get(instance) ?? null;
describe(validator, { type: 'minLength', min: 6 });

module.exports = {
  META,
  PASS,
  RequiredValidator,
  EmailValidator,
  MinLengthValidator,
  validator,
  valid,
  describe,
  getMeta,
};
