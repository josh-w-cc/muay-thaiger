import readSQL from '../utils/read-sql.js';

export async function up(knex) {
  const sql = await readSQL(import.meta.url, '../tables/fighter_moves.sql');
  await knex.raw(sql);
}

export async function down(knex) {
  await knex.raw('DROP TABLE IF EXISTS fighter_moves');
}
