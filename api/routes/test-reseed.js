import {RACES} from 'shared/races.js';
import {SKILL_SEED_ACTIONS} from 'shared/skills/index.js';
import {MOVE_SEED_MOVES} from 'shared/moves.js';
import {
  SEED_FIGHTERS,
  SEED_PLAYERS,
} from '../data/seed-data/seeds/001-fighters.js';

/**
 * @param {import('fastify').FastifyInstance} app
 */
export default async function testReseedRoutes(app) {
  app.post('/test/reseed', async (req, reply) => {
    await app.db.raw('TRUNCATE actions, fighter_actions, fighters, moves, players, races RESTART IDENTITY CASCADE');
    await app.db('moves').insert(MOVE_SEED_MOVES);
    await app.db('actions').insert(SKILL_SEED_ACTIONS);
    await app.db('players').insert(SEED_PLAYERS);
    await app.db('races').insert(RACES);
    await app.db('fighters').insert(SEED_FIGHTERS);
    return reply.code(204).send();
  });
}
