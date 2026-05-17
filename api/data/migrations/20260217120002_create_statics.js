import readSQL from '../utils/read-sql.js';


export async function up(knex) {
  const sql = await readSQL(import.meta.url, '../tables/statics.sql');
  await knex.raw(sql);
}

export async function down(knex) {
  await knex.raw('DROP TABLE IF EXISTS statics CASCADE');
  await knex.raw('DROP TYPE IF EXISTS entity_type');
}
