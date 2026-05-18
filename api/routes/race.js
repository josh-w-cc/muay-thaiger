import staticsModel from '../data/models/statics.js';


/**
 * @param {import('fastify').FastifyInstance} app
 */
export default async function raceRoutes(app) {
  const statics = staticsModel(app.db);

  app.get('/race', async () => statics.listRace());
}
