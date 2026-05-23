import {RACES} from 'shared/races.js';
import {SKILL_IDS, SKILL_SEED_ACTIONS} from 'shared/skills.js';


export const SEED_FIGHTERS = [
  {
    display_name: 'RamrodRit Jr',
    gold: '0',
    id: 1,
    player_id: 1,
    race: 1,
    stats: {anima: 1, durability: 1, reach: 2, speed: 1, strength: 0, vigor: 2, vitality: 2},
  },
  {
    display_name: 'SaklekSilva Jr',
    gold: '0',
    id: 2,
    player_id: 2,
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

export const SEED_RACES = RACES;

export async function seed(knex) {
  await insertActions(knex);
  await insertPlayers(knex);
  await insertRaces(knex);
  await insertFighters(knex);
  await resetSequences(knex);
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
    .insert(SEED_RACES)
    .onConflict('id')
    .ignore();
}

async function resetSequences(knex) {
  await knex.raw(
    `SELECT setval(pg_get_serial_sequence(?, 'id'), COALESCE((SELECT MAX(id) FROM "actions"), 0) + 1, false)`,
    ['actions'],
  );
  await knex.raw(
    `SELECT setval(pg_get_serial_sequence(?, 'id'), COALESCE((SELECT MAX(id) FROM "fighters"), 0) + 1, false)`,
    ['fighters'],
  );
  await knex.raw(
    `SELECT setval(pg_get_serial_sequence(?, 'id'), COALESCE((SELECT MAX(id) FROM "players"), 0) + 1, false)`,
    ['players'],
  );
  await knex.raw(
    `SELECT setval(pg_get_serial_sequence(?, 'id'), COALESCE((SELECT MAX(id) FROM "races"), 0) + 1, false)`,
    ['races'],
  );
}
