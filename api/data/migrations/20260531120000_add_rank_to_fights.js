export async function up(knex) {
  await knex.raw('ALTER TABLE fights ADD COLUMN IF NOT EXISTS rank TEXT');
}

export async function down(knex) {
  await knex.raw('ALTER TABLE fights DROP COLUMN IF EXISTS rank');
}
