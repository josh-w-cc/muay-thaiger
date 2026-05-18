import {
  generateCreateFn,
  generateFindFn,
  generateListFn,
  generateRemoveFn,
} from '../utils/crud.js';


export default function events(db) {
  return {
    create: generateCreateFn(db, 'events'),
    find: generateFindFn(db, 'events'),
    list: generateListFn(db, 'events', 'created_at'),
    remove: generateRemoveFn(db, 'events'),
  };
}
