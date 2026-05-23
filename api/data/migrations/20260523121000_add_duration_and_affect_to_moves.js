export async function up(knex) {
  await knex.raw(`
    ALTER TABLE moves
      ADD COLUMN IF NOT EXISTS affect TEXT NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS duration BIGINT NOT NULL DEFAULT 1
  `);
}

export async function down(knex) {
  await knex.raw(`
    ALTER TABLE moves
      DROP COLUMN IF EXISTS duration,
      DROP COLUMN IF EXISTS affect
  `);
}
