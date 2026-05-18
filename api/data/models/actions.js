import {
  generateCreateFn,
  generateFindFn,
  generateListFn,
  generateRemoveFn,
  generateUpdateFn,
} from '../utils/crud.js';


export default function actions(db) {
  return {
    create: generateCreateFn(db, 'actions'),
    find: generateFindFn(db, 'actions'),
    list: generateListFn(db, 'actions', 'name'),
    remove: generateRemoveFn(db, 'actions'),
    update: generateUpdateFn(db, 'actions'),
  };
}
