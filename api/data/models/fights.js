import {
  generateCreateFn,
  generateFindFn,
  generateListFn,
  generateRemoveFn,
  generateUpdateFn,
} from '../utils/crud.js';


export default function fights(db) {
  return {
    create: generateCreateFn(db, 'fights'),
    find: generateFindFn(db, 'fights'),
    list: generateListFn(db, 'fights', 'created_at'),
    remove: generateRemoveFn(db, 'fights'),
    update: generateUpdateFn(db, 'fights'),
  };
}
