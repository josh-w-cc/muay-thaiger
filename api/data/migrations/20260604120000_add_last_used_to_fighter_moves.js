export async function up(knex) {
  await knex.raw('ALTER TABLE fighter_moves ADD COLUMN last_used TIMESTAMPTZ');
}

export async function down(knex) {
  await knex.raw('ALTER TABLE fighter_moves DROP COLUMN last_used');
}
