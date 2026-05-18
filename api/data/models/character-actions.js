import {
  generateCreateFn,
  generateFindFn,
  generateListFn,
  generateRemoveFn,
} from '../utils/crud.js';


export default function characterActions(db) {
  return {
    create: generateCreateFn(db, 'character_actions'),
    find: generateFindFn(db, 'character_actions'),
    list: generateListFn(db, 'character_actions', 'created_at'),
    remove: generateRemoveFn(db, 'character_actions'),
  };
}
