export const SEED_ITEMS = [
  {id: 1, name: 'Design database schema'},
  {id: 2, name: 'Build API endpoints'},
  {id: 3, name: 'Set up project scaffolding'},
  {id: 4, name: 'Write project docs'},
];

export async function seed(knex) {
  await insertItems(knex);
  await resetSequences(knex);
}

async function insertItems(knex) {
  await knex('items')
    .insert(SEED_ITEMS)
    .onConflict('id')
    .ignore();
}

async function resetSequences(knex) {
  await knex.raw(
    `SELECT setval(pg_get_serial_sequence(?, 'id'), COALESCE((SELECT MAX(id) FROM "items"), 0) + 1, false)`,
    ['items'],
  );
}
