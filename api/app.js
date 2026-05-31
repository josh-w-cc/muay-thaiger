import websocket from '@fastify/websocket';
import Fastify from 'fastify';
import 'shared/bigInt.js';

import dbPlugin from './data/db.js';
import serveSPA from './plugins/serve-spa.js';
import actionsRoutes from './routes/actions.js';
import fightersRoutes from './routes/fighters.js';
import fightsRoutes from './routes/fights.js';
import healthRoutes from './routes/health.js';
import playersRoutes from './routes/players.js';
import raceRoutes from './routes/race.js';
import websocketRoutes from './routes/websocket.js';
import {attachScheduler} from './services/scheduler.js';


export default async function build(opts = {}) {
  const app = Fastify(opts);

  await app.register(dbPlugin);
  app.decorate('websocketConnections', new Set());
  await app.register(websocket);
  attachScheduler(app);
  await app.register(actionsRoutes, {prefix: '/api'});
  await app.register(fightersRoutes, {prefix: '/api'});
  await app.register(fightsRoutes, {prefix: '/api'});
  await app.register(healthRoutes);
  await app.register(websocketRoutes, {prefix: '/ws'});
  await app.register(playersRoutes, {prefix: '/api'});
  await app.register(raceRoutes, {prefix: '/api'});

  if(process.env.NODE_ENV !== 'production') {
    const {default: testReseed} = await import('./routes/test-reseed.js');
    await app.register(testReseed, {prefix: '/api'});
  }
  await app.register(serveSPA);

  return app;
}
