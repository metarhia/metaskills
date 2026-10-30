'use strict';

// Placeholder products: real ones implement storage and async iteration
class FileStorage {
  constructor(fileName) {
    this.fileName = fileName;
  }
}

class FileLineCursor {
  constructor(query, storage) {
    this.query = query;
    this.storage = storage;
  }
}

// Abstract factory: one key selects a consistent family of products
const dataAccess = {
  fs: {
    createDatabase: (...args) => new FileStorage(...args),
    createCursor: (...args) => new FileLineCursor(...args),
  },
  minio: {
    // factories collection for minio
  },
  // other implementations
};

// Usage:
// const accessLayer = dataAccess.fs;
// const storage = accessLayer.createDatabase('./storage.dat');
// const cursor = accessLayer.createCursor({ city: 'Roma' }, storage);
// for await (const record of cursor) {
//   console.dir(record);
// }

module.exports = { dataAccess };
