import {
  SEED_ACTIONS,
  SEED_MOVES,
  SEED_RACES,
} from '../data/seed-data/seeds/001-fighters.js';

/**
 * @param {import('fastify').FastifyInstance} app
 */
export default async function testReseedRoutes(app) {
  app.post('/test/reseed', async (req, reply) => {
    await app.db.raw('TRUNCATE actions, fighter_actions, fighters, moves, players, races RESTART IDENTITY CASCADE');
    await app.db('moves').insert(SEED_MOVES);
    await app.db('actions').insert(SEED_ACTIONS);
    await app.db('races').insert(SEED_RACES);
    return reply.code(204).send();
  });
}
