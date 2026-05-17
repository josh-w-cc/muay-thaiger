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
    list: generateListFn(db, 'players', 'display_name'),
    remove: generateRemoveFn(db, 'players'),
    update: generateUpdateFn(db, 'players'),
  };
}
