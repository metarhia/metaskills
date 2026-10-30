'use strict';

const calculateTotal = (order) => {
  const items = Array.isArray(order) ? order : Object.values(order);
  return items.reduce((sum, item) => {
    if (typeof item.price === 'number') return sum + item.price;
    return sum + calculateTotal(item);
  }, 0);
};

const json = `{
  "electronics": {
    "laptop": { "price": 1200 },
    "accessories": {
      "mouse": { "price": 25 },
      "keyboard": { "price": 75 }
    }
  },
  "books": {
    "fiction": { "price": 15 },
    "technical": { "price": 60 }
  }
}`;

const order = JSON.parse(json);
const total = calculateTotal(order);

module.exports = { calculateTotal, order, total };
