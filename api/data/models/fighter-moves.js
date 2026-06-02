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
    update: generateUpdateFn(db, 'fighter_moves'),
  };
}

function generateListEnabledByFighterIDFn(db) {
  return (fighterID) => db('fighter_moves')
    .where({enabled: true, fighter: fighterID})
    .orderBy('move');
}
