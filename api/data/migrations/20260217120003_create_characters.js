import readSQL from '../utils/read-sql.js';


export async function up(knex) {
  const sql = await readSQL(import.meta.url, '../tables/characters.sql');
  await knex.raw(sql);
}

export async function down(knex) {
  await knex.raw('DROP TABLE IF EXISTS fighters CASCADE');
}
