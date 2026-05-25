import 'shared/bigInt.js';

import {
  generateCreateFn,
  generateFindFn,
  generateListFn,
  generateRemoveFn,
  generateUpdateFn,
} from '../utils/crud.js';


export default function fighters(db) {
  const create = generateCreateFn(db, 'fighters');
  const find = generateFindFn(db, 'fighters');
  const list = generateListFn(db, 'fighters', 'display_name');
  const remove = generateRemoveFn(db, 'fighters');
  const update = generateUpdateFn(db, 'fighters');

  return {
    create: async (data) => deserializeFighter(await create(serializeFighter(data))),
    find: async (id) => deserializeFighter(await find(id)),
    findCurrentByPlayerID: generateFindCurrentByPlayerIDFn(db),
    list: async (...args) => (await list(...args)).map((fighter) => deserializeFighter(fighter)),
    remove,
    update: async (id, data) => deserializeFighter(await update(id, serializeFighter(data))),
  };
}

function generateFindCurrentByPlayerIDFn(db) {
  return async (playerId) => deserializeFighter(await db('fighters')
    .where({player_id: playerId, retired: false})
    .orderBy('created_at', 'desc')
    .first());
}

function deserializeFighter(fighter) {
  if(!fighter) {
    return fighter;
  }
  return {
    ...fighter,
    gold: toBigInt(fighter.gold),
    stats: deserializeStats(fighter.stats),
  };
}

function deserializeStats(stats = {}) {
  return Object.fromEntries(
    Object.entries(stats).map(([key, value]) => [key, toBigInt(value)]),
  );
}

function serializeFighter(fighter) {
  if(!fighter) {
    return fighter;
  }
  return {
    ...fighter,
    gold: fighter.gold === undefined ? fighter.gold : toBigInt(fighter.gold).toString(),
    stats: fighter.stats === undefined ? fighter.stats : serializeStats(fighter.stats),
  };
}

function serializeStats(stats = {}) {
  return Object.fromEntries(
    Object.entries(stats).map(([key, value]) => [key, toBigInt(value).toString()]),
  );
}

function toBigInt(value) {
  if(value === null || value === undefined || value === '') {
    return 0n;
  }
  try {
    return BigInt(value);
  }
  catch {
    return 0n;
  }
}
