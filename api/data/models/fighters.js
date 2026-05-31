import {
  generateCreateFn,
  generateFindFn,
  generateListFn,
  generateRemoveFn,
  generateUpdateFn,
} from '../utils/crud.js';
import {parseBigIntStats} from 'shared/stats.js';


export default function fighters(db) {
  const find = generateFindFn(db, 'fighters');
  const list = generateListFn(db, 'fighters', 'display_name');

  return {
    create: generateCreateFn(db, 'fighters'),
    find: async (id) => castStats(await find(id)),
    findCurrentByPlayerID: generateFindCurrentByPlayerIDFn(db),
    list: async (direction) => castStatsRows(await list(direction)),
    remove: generateRemoveFn(db, 'fighters'),
    update: generateUpdateFn(db, 'fighters'),
  };
}

function generateFindCurrentByPlayerIDFn(db) {
  return async (playerID) => {
    const fighter = await db('fighters')
      .where({player: playerID, retired: false})
      .orderBy('created_at', 'desc')
      .first();

    return castStats(fighter);
  };
}

function castStatsRows(rows) {
  if(Array.isArray(rows)) {
    return rows.map(castStats);
  }

  return castStats(rows);
}

function castStats(row) {
  if(!row?.stats) {
    return row ?? null;
  }

  return {
    ...row,
    stats: parseBigIntStats(row.stats),
  };
}
