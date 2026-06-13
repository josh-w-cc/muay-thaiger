import fp from 'fastify-plugin';
import fighters from '#api/data/models/fighters.js';

function PersistenceSystemPlugin(app) {
  const {db} = app;
  const {find, list} = fighters(db);
  setTimeout(async () => console.log(await list()), 100);
  setTimeout(async () => console.log(await find(3)), 1000);
  app.decorate('PersistenceSystem', {});
}

export default fp(PersistenceSystemPlugin, {
  name: 'PersistenceSystem',
  dependencies: ['db'],
});
