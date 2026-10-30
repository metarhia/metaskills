'use strict';

// Literal prototype + clone
const proto = { type: 'widget', color: 'blue' };
const cloneLiteral = () => ({ ...proto });

class Point {
  #x;
  #y;

  constructor(x, y) {
    this.#x = x;
    this.#y = y;
  }

  move(x, y) {
    this.#x += x;
    this.#y += y;
  }

  clone() {
    return new Point(this.#x, this.#y);
  }
}

class Line {
  #start;
  #end;

  constructor(start, end) {
    this.#start = start;
    this.#end = end;
  }

  move(x, y) {
    this.#start.move(x, y);
    this.#end.move(x, y);
  }

  clone() {
    const start = this.#start.clone();
    const end = this.#end.clone();
    return new Line(start, end);
  }
}

const p1 = new Point(0, 0);
const p2 = new Point(10, 20);
const line = new Line(p1, p2);
const cloned = line.clone();
cloned.move(2, 3);

const point = (x, y) => {
  const move = (dx, dy) => {
    x += dx;
    y += dy;
  };
  const clone = () => point(x, y);
  return { move, clone };
};

const { move, clone } = point(10, 20);
const c1 = clone();
move(-5, 10);

module.exports = {
  proto,
  cloneLiteral,
  Point,
  Line,
  line,
  cloned,
  point,
  c1,
};
