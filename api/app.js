import Fastify from 'fastify';

import dbPlugin from './data/db.js';
import serveSPA from './plugins/serve-spa.js';
import charactersRoutes from './routes/characters.js';
import healthRoutes from './routes/health.js';
import playersRoutes from './routes/players.js';


export default async function build(opts = {}) {
  const app = Fastify(opts);

  await app.register(dbPlugin);
  await app.register(healthRoutes);
  await app.register(charactersRoutes, {prefix: '/api'});
  await app.register(playersRoutes, {prefix: '/api'});

  if(process.env.NODE_ENV !== 'production') {
    const {default: testReseed} = await import('./routes/test-reseed.js');
    await app.register(testReseed, {prefix: '/api'});
  }
  await app.register(serveSPA);

  return app;
}
