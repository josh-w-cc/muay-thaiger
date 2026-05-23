import {
  generateCreateFn,
  generateFindFn,
  generateListFn,
  generateRemoveFn,
  generateUpdateFn,
} from '../utils/crud.js';


export default function moves(db) {
  return {
    create: generateCreateFn(db, 'moves'),
    find: generateFindFn(db, 'moves'),
    list: generateListFn(db, 'moves', 'name'),
    remove: generateRemoveFn(db, 'moves'),
    update: generateUpdateFn(db, 'moves'),
  };
}
