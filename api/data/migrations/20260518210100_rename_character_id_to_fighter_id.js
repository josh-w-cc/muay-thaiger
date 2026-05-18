export async function up(knex) {
  if(await knex.schema.hasColumn('events', 'character_id')) {
    await knex.schema.alterTable('events', (table) => {
      table.renameColumn('character_id', 'fighter_id');
    });
  }
  if(await knex.schema.hasColumn('fighter_actions', 'character_id')) {
    await knex.schema.alterTable('fighter_actions', (table) => {
      table.renameColumn('character_id', 'fighter_id');
    });
  }
}

export async function down(knex) {
  if(await knex.schema.hasColumn('events', 'fighter_id')) {
    await knex.schema.alterTable('events', (table) => {
      table.renameColumn('fighter_id', 'character_id');
    });
  }
  if(await knex.schema.hasColumn('fighter_actions', 'fighter_id')) {
    await knex.schema.alterTable('fighter_actions', (table) => {
      table.renameColumn('fighter_id', 'character_id');
    });
  }
}
