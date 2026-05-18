import {
  generateCreateFn,
  generateFindFn,
  generateRemoveFn,
  generateUpdateFn,
} from '../utils/crud.js';


export default function webhooks(db) {
  return {
    create: generateCreateFn(db, 'webhooks'),
    find: generateFindFn(db, 'webhooks'),
    listActive: () => db('webhooks').where({active: true}).orderBy('id'),
    remove: generateRemoveFn(db, 'webhooks'),
    update: generateUpdateFn(db, 'webhooks'),
  };
}
