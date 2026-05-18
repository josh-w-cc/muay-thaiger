import {
  generateCreateFn,
  generateFindFn,
  generateListFn,
  generateRemoveFn,
  generateUpdateFn,
} from '../utils/crud.js';


export default function characters(db) {
  return {
    create: generateCreateFn(db, 'characters'),
    find: generateFindFn(db, 'characters'),
    findCurrentByPlayerID: generateFindCurrentByPlayerIDFn(db),
    list: generateListFn(db, 'characters', 'display_name'),
    remove: generateRemoveFn(db, 'characters'),
    update: generateUpdateFn(db, 'characters'),
  };
}

function generateFindCurrentByPlayerIDFn(db) {
  return (playerID) => db('characters')
    .where({player_id: playerID, retired: false})
    .orderBy('created_at', 'desc')
    .first();
}
