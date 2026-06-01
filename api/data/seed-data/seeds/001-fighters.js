import {RACES} from 'shared/races.js';
import {SKILL_IDS, SKILL_SEED_ACTIONS} from 'shared/skills/index.js';
import {MOVE_IDS, MOVE_SEED_MOVES} from 'shared/moves.js';

export const SEED_FIGHTERS = [
  {
    display_name: 'RamrodRit Jr',
    gold: '0',
    id: 1,
    player: 1,
    race: 1,
    stats: {anima: 1, durability: 1, reach: 2, speed: 1, strength: 0, vigor: 2, vitality: 2},
  },
  {
    display_name: 'SaklekSilva Jr',
    gold: '0',
    id: 2,
    player: 2,
    race: 2,
    stats: {anima: 2, durability: 2, reach: 1, speed: 2, strength: 0, vigor: 1, vitality: 1},
  },
];

export const SEED_PLAYERS = [
  {display_name: 'RamrodRit', id: 1, token: 'seed-token-ramrodrit'},
  {display_name: 'SaklekSilva', id: 2, token: 'seed-token-sakleksilva'},
  {display_name: 'ChokdeeChen', id: 3, token: 'seed-token-chokdeechen'},
  {display_name: 'TigerJab', id: 4, token: 'seed-token-tigerjab'},
];

export {SKILL_IDS};
export const SEED_ACTIONS = SKILL_SEED_ACTIONS;
export {MOVE_IDS};
export const SEED_MOVES = MOVE_SEED_MOVES;

export const SEED_RACES = RACES;

export async function seed(knex) {
  await insertMoves(knex);
  await insertActions(knex);
  await insertPlayers(knex);
  await insertRaces(knex);
  await insertFighters(knex);
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

async function insertPlayers(knex) {
  await knex('players')
    .insert(SEED_PLAYERS)
    .onConflict('id')
    .ignore();
}

async function insertFighters(knex) {
  await knex('fighters')
    .insert(SEED_FIGHTERS)
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
  for(const table of ['actions', 'fighters', 'moves', 'players', 'races']) {
    await resetSequence(knex, table);
  }
}

async function resetSequence(knex, table) {
  await knex.raw(`SELECT setval(pg_get_serial_sequence(?, 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 0) + 1, false)`, [table]);
}
