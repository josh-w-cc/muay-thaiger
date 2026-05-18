import websocket from '@fastify/websocket';
import Fastify from 'fastify';

import dbPlugin from './data/db.js';
import playerID from './plugins/player-id.js';
import serveSPA from './plugins/serve-spa.js';
import actionsRoutes from './routes/actions.js';
import characterActionsRoutes from './routes/character-actions.js';
import charactersRoutes from './routes/characters.js';
import connectRoutes from './routes/connect.js';
import healthRoutes from './routes/health.js';
import playersRoutes from './routes/players.js';
import raceRoutes from './routes/race.js';


export default async function build(opts = {}) {
  const app = Fastify(opts);

  await app.register(dbPlugin);
  await playerID(app);
  await app.register(websocket);
  await app.register(actionsRoutes, {prefix: '/api'});
  await app.register(characterActionsRoutes, {prefix: '/ws'});
  await app.register(charactersRoutes, {prefix: '/api'});
  await app.register(healthRoutes);
  await app.register(connectRoutes, {prefix: '/ws'});
  await app.register(playersRoutes, {prefix: '/api'});
  await app.register(raceRoutes, {prefix: '/api'});

  if(process.env.NODE_ENV !== 'production') {
    const {default: testReseed} = await import('./routes/test-reseed.js');
    await app.register(testReseed, {prefix: '/api'});
  }
  await app.register(serveSPA);

  return app;
}
