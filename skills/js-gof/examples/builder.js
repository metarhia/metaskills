'use strict';

class QueryBuilder {
  #options;

  constructor(table) {
    this.#options = { table, where: {}, limit: null, order: null };
  }

  where(cond) {
    Object.assign(this.#options.where, cond);
    return this;
  }

  order(field) {
    this.#options.order = field;
    return this;
  }

  limit(n) {
    this.#options.limit = n;
    return this;
  }

  build() {
    const where = { ...this.#options.where };
    return { ...this.#options, where };
  }
}

const query = new QueryBuilder('User')
  .where({ active: true })
  .order('name')
  .limit(10)
  .build();

// Alternatively: async constructor (`await new QueryBuilder`)
// or declarative init with all steps in one structure:
// const query = await new QueryBuilder({
//   entity: 'User',
//   where: { active: true },
//   order: 'name',
//   limit: 10,
// });

module.exports = { QueryBuilder, query };
