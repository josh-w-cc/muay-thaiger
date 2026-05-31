import {
  generateCreateFn,
  generateFindFn,
  generateListFn,
  generateRemoveFn,
  generateUpdateFn,
} from '../utils/crud.js';


export default function fighterMoves(db) {
  return {
    create: generateCreateFn(db, 'fighter_moves'),
    find: generateFindFn(db, 'fighter_moves'),
    list: generateListFn(db, 'fighter_moves', 'id'),
    remove: generateRemoveFn(db, 'fighter_moves'),
    update: generateUpdateFn(db, 'fighter_moves'),
  };
}
