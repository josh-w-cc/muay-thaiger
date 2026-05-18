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
    findCurrentByPlayerID: (playerID) => db('characters')
      .where({player_id: playerID, retired: false})
      .orderBy('id', 'desc')
      .first(),
    list: generateListFn(db, 'characters', 'display_name'),
    remove: generateRemoveFn(db, 'characters'),
    update: generateUpdateFn(db, 'characters'),
  };
}
