import {SEED_PLAYERS} from '../data/seed-data/seeds/001-sample-board.js';

/**
 * @param {import('fastify').FastifyInstance} app
 */
export default async function testReseedRoutes(app) {
  app.post('/test/reseed', async (req, reply) => {
    await app.db.raw('TRUNCATE players RESTART IDENTITY CASCADE');
    await app.db('players').insert(SEED_PLAYERS);
    return reply.code(204).send();
  });
}
