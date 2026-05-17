import {SEED_PLAYERS, SEED_RACES} from '../data/seed-data/seeds/001-sample-board.js';

/**
 * @param {import('fastify').FastifyInstance} app
 */
export default async function testReseedRoutes(app) {
  app.post('/test/reseed', async (req, reply) => {
    await app.db.raw('TRUNCATE players, races RESTART IDENTITY CASCADE');
    await app.db('players').insert(SEED_PLAYERS);
    await app.db('races').insert(SEED_RACES);
    return reply.code(204).send();
  });
}
