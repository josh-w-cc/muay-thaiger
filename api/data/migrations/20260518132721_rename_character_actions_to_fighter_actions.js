export async function up(knex) {
  await knex.raw('ALTER TABLE IF EXISTS character_actions RENAME TO fighter_actions');
}

export async function down(knex) {
  await knex.raw('ALTER TABLE IF EXISTS fighter_actions RENAME TO character_actions');
}
