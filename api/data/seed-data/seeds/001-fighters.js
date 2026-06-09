import {RACES} from 'shared/races.js';
import {SKILL_SEED_ACTIONS} from 'shared/skills/index.js';
import {MOVE_SEED_MOVES} from 'shared/moves.js';

export const SEED_ACTIONS = SKILL_SEED_ACTIONS;
export const SEED_MOVES = MOVE_SEED_MOVES;

export const SEED_RACES = RACES;

export async function seed(knex) {
  await insertMoves(knex);
  await insertActions(knex);
  await insertRaces(knex);
  await resetSequences(knex);
}

async function insertMoves(knex) {
  await knex('moves')
    .insert(SEED_MOVES)
    .onConflict('id')
    .ignore();
}

async function insertActions(knex) {
  await knex('actions')
    .insert(SEED_ACTIONS)
    .onConflict('id')
    .ignore();
}

async function insertRaces(knex) {
  await knex('races')
    .insert(SEED_RACES.map(serializeRace))
    .onConflict('id')
    .ignore();
}

function serializeRace(race) {
  return {
    ...race,
    stats: Object.fromEntries(
      Object.entries(race.stats).map(([key, value]) => [key, Number(value)]),
    ),
  };
}

async function resetSequences(knex) {
  for(const table of ['actions', 'moves', 'races']) {
    await resetSequence(knex, table);
  }
}

async function resetSequence(knex, table) {
  await knex.raw(`SELECT setval(pg_get_serial_sequence(?, 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 0) + 1, false)`, [table]);
}
