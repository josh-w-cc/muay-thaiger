import {generateFindFn} from '../utils/crud.js';
import {castStats, castStatsRows} from '../utils/stats.js';

export default function races(db) {
  const find = generateFindFn(db, 'races');

  return {
    find: async (id) => castStats(await find(id)),
    list: async () => castStatsRows(await db('races').orderBy('name')),
  };
}
