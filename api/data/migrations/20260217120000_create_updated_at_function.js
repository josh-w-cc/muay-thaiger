import readSQL from '../utils/read-sql.js';


export async function up(knex) {
  const sql = await readSQL(import.meta.url, '20260217120000_create_updated_at_function.sql');
  await knex.raw(sql);
}

export async function down(knex) {
  await knex.raw('DROP FUNCTION IF EXISTS update_updated_at_column()');
}
