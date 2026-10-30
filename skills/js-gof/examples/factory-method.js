'use strict';

class Person {
  constructor(name) {
    this.name = name;
  }

  static factory(name) {
    return new Person(name);
  }
}

class Product {
  constructor(value) {
    this.field = value;
  }
}

class Creator {
  factoryMethod(...args) {
    return new this.ProductType(...args);
  }
}

class Circle {
  constructor(radius) {
    this.radius = radius;
  }
}

class Square {
  constructor(side) {
    this.side = side;
  }
}

// Registry instead of a switch: keys come from data (config, JSON, input)
const SHAPES = { circle: Circle, square: Square };

const createShape = (kind, size) => {
  const Shape = SHAPES[kind];
  if (!Shape) throw new Error(`Unknown shape: ${kind}`);
  return new Shape(size);
};

module.exports = { Person, Product, Creator, SHAPES, createShape };
