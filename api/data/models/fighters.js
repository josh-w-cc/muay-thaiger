import {
  generateCreateFn,
  generateFindFn,
  generateListFn,
  generateRemoveFn,
  generateUpdateFn,
} from '../utils/crud.js';
import {castStats, castStatsRows} from '../utils/stats.js';


export default function fighters(db) {
  const create = generateCreateFn(db, 'fighters');
  const find = generateFindFn(db, 'fighters');
  const list = generateListFn(db, 'fighters', 'display_name');
  const update = generateUpdateFn(db, 'fighters');

  return {
    create: (data) => create(serializeFighterStats(data)),
    find: async (id) => castStats(await find(id)),
    findCurrentByPlayerID: generateFindCurrentByPlayerIDFn(db),
    list: async (direction) => castStatsRows(await list(direction)),
    remove: generateRemoveFn(db, 'fighters'),
    update: (id, data) => update(id, serializeFighterStats(data)),
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

function serializeFighterStats(data) {
  if(!data?.stats) {
    return data;
  }

  return {
    ...data,
    stats: Object.fromEntries(
      Object.entries(data.stats).map(([key, value]) => [key, typeof value === 'bigint' ? value.toString() : value]),
    ),
  };
}
