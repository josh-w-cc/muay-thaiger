export async function up(knex) {
  await knex.raw(`ALTER TABLE characters ADD COLUMN IF NOT EXISTS gold TEXT NOT NULL DEFAULT '0'`);
}

export async function down(knex) {
  await knex.raw('ALTER TABLE characters DROP COLUMN IF EXISTS gold');
}
