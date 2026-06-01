import readSQL from '../utils/read-sql.js';

export async function up(knex) {
  const componentsSQL = await readSQL(import.meta.url, '../tables/components.sql');
  const entityComponentsSQL = await readSQL(import.meta.url, '../tables/entity_components.sql');
  await knex.raw(componentsSQL);
  await knex.raw(entityComponentsSQL);
}

export async function down(knex) {
  await knex.raw('DROP TABLE IF EXISTS entity_components CASCADE');
  await knex.raw('DROP TABLE IF EXISTS components CASCADE');
}
