import {SEED_ACTIONS, SEED_CHARACTERS, SEED_PLAYERS, SEED_STATICS} from '../data/seed-data/seeds/001-fighters.js';

/**
 * @param {import('fastify').FastifyInstance} app
 */
export default async function testReseedRoutes(app) {
  app.post('/test/reseed', async (req, reply) => {
    await app.db.raw('TRUNCATE actions, players, races, fighters, fighter_actions RESTART IDENTITY CASCADE');
    await app.db('actions').insert(SEED_ACTIONS);
    await app.db('players').insert(SEED_PLAYERS);
    await app.db('races').insert(SEED_STATICS);
    await app.db('fighters').insert(SEED_CHARACTERS);
    return reply.code(204).send();
  });
}
