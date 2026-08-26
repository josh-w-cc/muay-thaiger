import {
  generateCreateFn,
  generateFindFn,
  generateListFn,
  generateRemoveFn,
  generateUpdateFn,
} from '../utils/crud.js';
import {FIGHTER_STAT_KEYS} from 'shared/stats.js';
import {castStats, castStatsRows, serializeStats} from '../utils/stats.js';


export default function fighters(db) {
  const create = generateCreateFn(db, 'fighters');
  const find = generateFindFn(db, 'fighters');
  const list = generateListFn(db, 'fighters', 'display_name');
  const update = generateUpdateFn(db, 'fighters');

  return {
    create: (data) => create(serializeFighterStats(withDefaultStats(data))),
    find: async (id) => castFighter(await find(id)),
    findCurrentByPlayerID: generateFindCurrentByPlayerIDFn(db),
    list: async (direction) => castFighterRows(await list(direction)),
    remove: generateRemoveFn(db, 'fighters'),
    update: async (id, data) => castFighter(await update(id, serializeFighterStats(data))),
  };
}

function withDefaultStats(data) {
  if(!data?.stats) {
    return data;
  }

  return {
    ...data,
    stats: {
      ...Object.fromEntries(FIGHTER_STAT_KEYS.map((key) => [key, 0])),
      ...data.stats,
    },
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
  if(!row) {
    return null;
  }

  return {
    ...row,
    gold: BigInt(row.gold ?? 0),
  };
}

function serializeFighterStats(data) {
  if(!data?.stats) {
    return data;
  }

  return {
    ...data,
    stats: serializeStats(data.stats),
  };
}
