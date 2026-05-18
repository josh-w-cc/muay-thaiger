import websocket from '@fastify/websocket';
import Fastify from 'fastify';

import {API_PREFIX, WS_PREFIX} from '../shared/constants.js';
import dbPlugin from './data/db.js';
import serveSPA from './plugins/serve-spa.js';
import actionsRoutes from './routes/actions.js';
import charactersRoutes from './routes/characters.js';
import connectRoutes from './routes/connect.js';
import healthRoutes from './routes/health.js';
import playersRoutes from './routes/players.js';
import raceRoutes from './routes/race.js';


export default async function build(opts = {}) {
  const app = Fastify(opts);

  await app.register(dbPlugin);
  await app.register(websocket);
  await app.register(actionsRoutes, {prefix: API_PREFIX});
  await app.register(charactersRoutes, {prefix: API_PREFIX});
  await app.register(healthRoutes);
  await app.register(connectRoutes, {prefix: WS_PREFIX});
  await app.register(playersRoutes, {prefix: API_PREFIX});
  await app.register(raceRoutes, {prefix: API_PREFIX});

  if(process.env.NODE_ENV !== 'production') {
    const {default: testReseed} = await import('./routes/test-reseed.js');
    await app.register(testReseed, {prefix: API_PREFIX});
  }
  await app.register(serveSPA);

  return app;
}
