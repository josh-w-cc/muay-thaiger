import {
  generateCreateFn,
  generateFindFn,
  generateListFn,
  generateRemoveFn,
  generateUpdateFn,
} from '../utils/crud.js';
import {normalizeFighter} from 'shared/fighter-stats.js';


export default function fighters(db) {
  const create = generateCreateFn(db, 'fighters');
  const find = generateFindFn(db, 'fighters');
  const findCurrentByPlayerID = generateFindCurrentByPlayerIDFn(db);
  const list = generateListFn(db, 'fighters', 'display_name');
  const update = generateUpdateFn(db, 'fighters');

  return {
    create: async (data) => normalizeFighter(await create(data)),
    find: async (id) => normalizeFighter(await find(id)),
    findCurrentByPlayerID: async (playerId) => normalizeFighter(await findCurrentByPlayerID(playerId)),
    list: async () => (await list()).map(normalizeFighter),
    remove: generateRemoveFn(db, 'fighters'),
    update: async (id, data) => normalizeFighter(await update(id, data)),
  };
}

function generateFindCurrentByPlayerIDFn(db) {
  return (playerId) => db('fighters')
    .where({player_id: playerId, retired: false})
    .orderBy('created_at', 'desc')
    .first();
}
