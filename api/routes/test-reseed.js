import {
  SEED_ACTIONS,
  SEED_FIGHTERS,
  SEED_MOVES,
  SEED_PLAYERS,
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
    await app.db('players').insert(SEED_PLAYERS);
    await app.db('races').insert(SEED_RACES);
    await app.db('fighters').insert(SEED_FIGHTERS);
    return reply.code(204).send();
  });
}
