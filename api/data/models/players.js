import {
  generateCreateFn,
  generateFindFn,
  generateListFn,
  generateRemoveFn,
  generateUpdateFn,
} from '../utils/crud.js';


export default function players(db) {
  return {
    create: generateCreateFn(db, 'players'),
    find: generateFindFn(db, 'players'),
    findByToken: (token) => db('players').where({token}).first(),
    list: generateListFn(db, 'players', 'display_name'),
    remove: generateRemoveFn(db, 'players'),
    update: generateUpdateFn(db, 'players'),
  };
}
