'use strict';

const createUser = (name, role) => ({ name, role, createdAt: Date.now() });
const createAdmin = (name) => createUser(name, 'admin');

class Connection {
  constructor(url) {
    this.url = url;
  }
}

const createConnection = (() => {
  let index = 0;
  return () => new Connection(`http://10.0.0.1/${index++}`);
})();

module.exports = { createUser, createAdmin, Connection, createConnection };
