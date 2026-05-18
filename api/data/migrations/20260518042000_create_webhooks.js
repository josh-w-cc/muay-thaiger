import readSQL from '../utils/read-sql.js';

export async function up(knex) {
  const sql = await readSQL(import.meta.url, '../tables/webhooks.sql');
  await knex.raw(sql);
}

export async function down(knex) {
  await knex.raw('DROP TABLE IF EXISTS webhooks CASCADE');
}
