import {
  generateCreateFn,
  generateFindFn,
  generateListFn,
  generateRemoveFn,
  generateUpdateFn,
} from '../utils/crud.js';


export default function fighters(db) {
  return {
    create: generateCreateFn(db, 'fighters'),
    find: generateFindFn(db, 'fighters'),
    findCurrentByPlayerID: generateFindCurrentByPlayerIDFn(db),
    list: generateListFn(db, 'fighters', 'display_name'),
    remove: generateRemoveFn(db, 'fighters'),
    update: generateUpdateFn(db, 'fighters'),
  };
}

function generateFindCurrentByPlayerIDFn(db) {
  return (playerId) => db('fighters')
    .where({player: playerId, retired: false})
    .orderBy('created_at', 'desc')
    .first();
}
