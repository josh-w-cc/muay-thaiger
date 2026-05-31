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
    findActiveByFighterID: async (fighterID) => findActiveFightByFighterID(db, fighterID),
    list: generateListFn(db, 'fights', 'created_at'),
    remove: generateRemoveFn(db, 'fights'),
    update: generateUpdateFn(db, 'fights'),
  };
}

async function findActiveFightByFighterID(db, fighterID) {
  return db('fights')
    .whereNull('victory')
    .whereRaw('(attacker = ? OR defender = ?)', [fighterID, fighterID])
    .orderBy('created_at', 'desc')
    .first();
}
