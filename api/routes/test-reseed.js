import {SEED_CHARACTERS, SEED_ENTITIES, SEED_PLAYERS} from '../data/seed-data/seeds/001-sample-board.js';

/**
 * @param {import('fastify').FastifyInstance} app
 */
export default async function testReseedRoutes(app) {
  app.post('/test/reseed', async (req, reply) => {
    await app.db.raw('TRUNCATE players, entities, characters RESTART IDENTITY CASCADE');
    await app.db('players').insert(SEED_PLAYERS);
    await app.db('entities').insert(SEED_ENTITIES);
    await app.db('characters').insert(SEED_CHARACTERS);
    return reply.code(204).send();
  });
}
