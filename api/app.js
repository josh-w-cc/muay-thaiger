import websocket from '@fastify/websocket';
import Fastify from 'fastify';

import dbPlugin from './data/db.js';
import serveSPA from './plugins/serve-spa.js';
import charactersRoutes from './routes/characters.js';
import connectRoutes from './routes/connect.js';
import healthRoutes from './routes/health.js';
import playersRoutes from './routes/players.js';


export default async function build(opts = {}) {
  const app = Fastify(opts);

  await app.register(dbPlugin);
  await app.register(websocket);
  await app.register(charactersRoutes, {prefix: '/api'});
  await app.register(healthRoutes);
  await app.register(connectRoutes, {prefix: '/ws'});
  await app.register(playersRoutes, {prefix: '/api'});

  if(process.env.NODE_ENV !== 'production') {
    const {default: testReseed} = await import('./routes/test-reseed.js');
    await app.register(testReseed, {prefix: '/api'});
  }
  await app.register(serveSPA);

  return app;
}
