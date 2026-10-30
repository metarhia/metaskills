'use strict';

const createApi = (db, cache, logger) => ({
  async getUser(id) {
    const cached = cache.get(id);
    if (cached) return cached;
    const user = await db.row('User', ['*'], { id });
    cache.set(id, user);
    logger.info(`User ${id} loaded`);
    return user;
  },
});

// Scheduler façade — hides Timer, Logger, Task, etc.:
// scheduler.task('name2', '2019-03-12T14:37Z', (done) => {
//   setTimeout(() => {
//     done(new Error('task failed'));
//   }, 1100);
// });

module.exports = { createApi };
