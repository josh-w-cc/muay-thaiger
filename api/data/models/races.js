import {generateFindFn} from '../utils/crud.js';
import {parseBigIntStats} from 'shared/stats.js';

export default function races(db) {
  const find = generateFindFn(db, 'races');

  return {
    find: async (id) => castStats(await find(id)),
    list: async () => castStatsRows(await db('races').orderBy('name')),
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
