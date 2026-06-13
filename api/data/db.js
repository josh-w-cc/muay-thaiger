import fp from 'fastify-plugin';
import knex from 'knex';
import pg from 'pg';

import config from './knexfile.js';


pg.types.setTypeParser(20, Number);

async function db(app) {
  const db = knex(config);
  app.decorate('db', db);
  app.addHook('onClose', () => db.destroy());
}

export default fp(db, {
  name: 'db',
});
