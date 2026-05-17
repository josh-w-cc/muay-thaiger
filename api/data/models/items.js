import {
  generateCreateFn,
  generateFindFn,
  generateListFn,
  generateRemoveFn,
  generateUpdateFn,
} from '../utils/crud.js';


export default function items(db) {
  return {
    create: generateCreateFn(db, 'items'),
    find: generateFindFn(db, 'items'),
    list: generateListFn(db, 'items', 'name'),
    remove: generateRemoveFn(db, 'items'),
    update: generateUpdateFn(db, 'items'),
  };
}
