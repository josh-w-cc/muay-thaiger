import {generateCrudModel} from '../utils/crud.js';


export default function fighterMoves(db) {
  return {
    ...generateCrudModel(db, 'fighter_moves', {listOrderBy: 'id'}),
    listEnabledByFighterID: generateListEnabledByFighterIDFn(db),
  };
}

function generateListEnabledByFighterIDFn(db) {
  return (fighterID) => db('fighter_moves')
    .where({enabled: true, fighter: fighterID})
    .orderBy('move');
}
