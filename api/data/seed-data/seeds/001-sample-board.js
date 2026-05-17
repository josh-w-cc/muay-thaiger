export const SEED_PLAYERS = [
  {display_name: 'RamrodRit', id: 1},
  {display_name: 'SaklekSilva', id: 2},
  {display_name: 'ChokdeeChen', id: 3},
  {display_name: 'TigerJab', id: 4},
];

export const SEED_RACES = [
  {
    id: 1,
    name: 'Tiger',
    stats: {anima: 1, durability: 1, reach: 2, speed: 1, strength: 2, vitality: 2},
  },
  {
    id: 2,
    name: 'Snow Leopard',
    stats: {anima: 2, durability: 2, reach: 1, speed: 2, strength: 1, vitality: 1},
  },
];

export async function seed(knex) {
  await insertPlayers(knex);
  await insertRaces(knex);
  await resetSequences(knex);
}

async function insertPlayers(knex) {
  await knex('players')
    .insert(SEED_PLAYERS)
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
    `SELECT setval(pg_get_serial_sequence(?, 'id'), COALESCE((SELECT MAX(id) FROM "players"), 0) + 1, false)`,
    ['players'],
  );
  await knex.raw(
    `SELECT setval(pg_get_serial_sequence(?, 'id'), COALESCE((SELECT MAX(id) FROM "races"), 0) + 1, false)`,
    ['races'],
  );
}
