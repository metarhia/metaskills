'use strict';

const fs = require('node:fs');

const statistics = { bytes: 0, chunks: 0, events: {} };

class StatReadStream extends fs.ReadStream {
  emit(name, ...args) {
    if (name === 'data') {
      statistics.bytes += args[0].length;
      statistics.chunks++;
    }
    const counter = statistics.events[name] ?? 0;
    statistics.events[name] = counter + 1;
    return super.emit(name, ...args);
  }
}

const getStatistics = () => structuredClone(statistics);

const createReadStream = (path, options) => new StatReadStream(path, options);

// Prefer this GoF-style proxy over built-in `Proxy` when possible (deopts).
module.exports = { ...fs, createReadStream, getStatistics, StatReadStream };
