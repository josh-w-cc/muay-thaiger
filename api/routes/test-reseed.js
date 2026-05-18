import {SEED_CHARACTERS, SEED_PLAYERS, SEED_STATICS} from '../data/seed-data/seeds/001-fighters.js';

/**
 * @param {import('fastify').FastifyInstance} app
 */
export default async function testReseedRoutes(app) {
  app.post('/test/reseed', async (req, reply) => {
    await app.db.raw('TRUNCATE players, statics, characters RESTART IDENTITY CASCADE');
    await app.db('players').insert(SEED_PLAYERS);
    await app.db('statics').insert(SEED_STATICS);
    await app.db('characters').insert(SEED_CHARACTERS);
    return reply.code(204).send();
  });
}
