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
    listEnabledByFighterID: generateListEnabledByFighterIDFn(db),
    remove: generateRemoveFn(db, 'fighter_moves'),
    touchLastUsedByFighterID: generateTouchLastUsedByFighterIDFn(db),
    update: generateUpdateFn(db, 'fighter_moves'),
  };
}

function generateListEnabledByFighterIDFn(db) {
  return (fighterID) => db('fighter_moves')
    .where({enabled: true, fighter: fighterID})
    .orderBy('move');
}

function generateTouchLastUsedByFighterIDFn(db) {
  return (fighterID) => db('fighter_moves')
    .where({enabled: true, fighter: fighterID})
    .update({last_used: db.fn.now()});
}
