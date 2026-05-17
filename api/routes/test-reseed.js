import {SEED_ITEMS} from '../data/seed-data/seeds/001-sample-board.js';

/**
 * @param {import('fastify').FastifyInstance} app
 */
export default async function testReseedRoutes(app) {
  app.post('/test/reseed', async (req, reply) => {
    await app.db.raw('TRUNCATE items RESTART IDENTITY CASCADE');
    await app.db('items').insert(SEED_ITEMS);
    return reply.code(204).send();
  });
}
