export const SEED_PLAYERS = [
  {display_name: 'RamrodRit', id: 1, token: 'seed-token-ramrodrit'},
  {display_name: 'SaklekSilva', id: 2, token: 'seed-token-sakleksilva'},
  {display_name: 'ChokdeeChen', id: 3, token: 'seed-token-chokdeechen'},
  {display_name: 'TigerJab', id: 4, token: 'seed-token-tigerjab'},
];

export async function seed(knex) {
  await insertPlayers(knex);
  await resetSequences(knex);
}

async function insertPlayers(knex) {
  await knex('players')
    .insert(SEED_PLAYERS)
    .onConflict('id')
    .ignore();
}

async function resetSequences(knex) {
  await knex.raw(
    `SELECT setval(pg_get_serial_sequence(?, 'id'), COALESCE((SELECT MAX(id) FROM "players"), 0) + 1, false)`,
    ['players'],
  );
}
