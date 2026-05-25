import {
  generateCreateFn,
  generateFindFn,
  generateListFn,
  generateRemoveFn,
  generateUpdateFn,
} from '../utils/crud.js';


export default function fighters(db) {
  return {
    create: generateCreateFn(db, 'fighters', castFighterStatsToHugeNumber),
    find: generateFindFn(db, 'fighters'),
    findCurrentByPlayerID: generateFindCurrentByPlayerIDFn(db),
    list: generateListFn(db, 'fighters', 'display_name'),
    remove: generateRemoveFn(db, 'fighters'),
    update: generateUpdateFn(db, 'fighters', castFighterStatsToHugeNumber),
  };
}

function generateFindCurrentByPlayerIDFn(db) {
  return (playerId) => db('fighters')
    .where({player_id: playerId, retired: false})
    .orderBy('created_at', 'desc')
    .first();
}

function castFighterStatsToHugeNumber(data) {
  if(!data?.stats || typeof data.stats !== 'object') {
    return data;
  }
  return {
    ...data,
    stats: Object.fromEntries(
      Object.entries(data.stats).map(([name, value]) => [
        name,
        typeof value === 'number' ? `${value}` : value,
      ]),
    ),
  };
}
