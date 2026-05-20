import {generateFindFn} from '../utils/crud.js';


export default function races(db) {
  return {
    find: generateFindFn(db, 'races'),
    list: () => db('races').orderBy('name'),
  };
}
