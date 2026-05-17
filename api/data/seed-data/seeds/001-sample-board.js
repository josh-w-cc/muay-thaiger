export const SEED_PLAYERS = [
  {display_name: 'RamrodRit', id: 1, token: 'seed-token-ramrodrit'},
  {display_name: 'SaklekSilva', id: 2, token: 'seed-token-sakleksilva'},
  {display_name: 'ChokdeeChen', id: 3, token: 'seed-token-chokdeechen'},
  {display_name: 'TigerJab', id: 4, token: 'seed-token-tigerjab'},
];

export const SEED_ENTITIES = [
  {
    id: 1,
    name: 'Tiger',
    stats: {anima: 1, durability: 1, reach: 2, speed: 1, strength: 2, vitality: 2},
    type: 'race',
  },
  {
    id: 2,
    name: 'Snow Leopard',
    stats: {anima: 2, durability: 2, reach: 1, speed: 2, strength: 1, vitality: 1},
    type: 'race',
  },
];

export async function seed(knex) {
  await insertPlayers(knex);
  await insertEntities(knex);
  await resetSequences(knex);
}

async function insertPlayers(knex) {
  await knex('players')
    .insert(SEED_PLAYERS)
    .onConflict('id')
    .ignore();
}

async function insertEntities(knex) {
  await knex('entities')
    .insert(SEED_ENTITIES)
    .onConflict('id')
    .ignore();
}

async function resetSequences(knex) {
  await knex.raw(
    `SELECT setval(pg_get_serial_sequence(?, 'id'), COALESCE((SELECT MAX(id) FROM "players"), 0) + 1, false)`,
    ['players'],
  );
  await knex.raw(
    `SELECT setval(pg_get_serial_sequence(?, 'id'), COALESCE((SELECT MAX(id) FROM "entities"), 0) + 1, false)`,
    ['entities'],
  );
}
