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
    find: async (id) => castFighter(await find(id)),
    findCurrentByPlayerID: generateFindCurrentByPlayerIDFn(db),
    list: async (direction) => castFighterRows(await list(direction)),
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

    return castFighter(fighter);
  };
}

function castFighterRows(rows) {
  if(Array.isArray(rows)) {
    return castStatsRows(rows).map(castFighterGold);
  }

  return castFighterGold(castStatsRows(rows));
}

function castFighter(row) {
  return castFighterGold(castStats(row));
}

function castFighterGold(row) {
  if(!row || row.gold === undefined || row.gold === null) {
    return row ?? null;
  }

  return {
    ...row,
    gold: BigInt(row.gold),
  };
}

function serializeFighterStats(data) {
  if(!data?.stats) {
    return data;
  }

  return {
    ...data,
    stats: Object.fromEntries(
      Object.entries(data.stats).map(([key, value]) => [key, value.toString()]),
    ),
  };
}
