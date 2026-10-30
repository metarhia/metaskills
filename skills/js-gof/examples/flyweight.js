'use strict';

const flyweightPool = new Map();

const getFlyweight = (shared) => {
  const { char, font, size } = shared;
  const key = `${char}:${font}:${size}`;
  let flyweight = flyweightPool.get(key);
  if (!flyweight) {
    flyweight = Object.freeze({ ...shared });
    flyweightPool.set(key, flyweight);
  }
  return flyweight;
};

const createChar = (char, font, size, row, col) => {
  const intrinsic = getFlyweight({ char, font, size });
  return { intrinsic, row, col };
};

const a1 = createChar('A', 'Arial', 12, 0, 0);
const a2 = createChar('A', 'Arial', 12, 0, 5);

module.exports = {
  getFlyweight,
  createChar,
  shared: a1.intrinsic === a2.intrinsic,
};
