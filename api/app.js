import Fastify from 'fastify';

import dbPlugin from './data/db.js';
import serveSPA from './plugins/serve-spa.js';
import healthRoutes from './routes/health.js';
import itemsRoutes from './routes/items.js';


export default async function build(opts = {}) {
  const app = Fastify(opts);

  await app.register(dbPlugin);
  await app.register(healthRoutes);
  await app.register(itemsRoutes, {prefix: '/api'});

  if(process.env.NODE_ENV !== 'production') {
    const {default: testReseed} = await import('./routes/test-reseed.js');
    await app.register(testReseed, {prefix: '/api'});
  }
  await app.register(serveSPA);

  return app;
}
