import fightersModel from './fighters.js';
import {
  generateCreateFn,
  generateFindFn,
  generateRemoveFn,
} from '../utils/crud.js';


export default function fighterActions(db) {
  const fighters = fightersModel(db);
  return {
    create: generateCreateFn(db, 'fighter_actions'),
    find: generateFindFn(db, 'fighter_actions'),
    list: generateListFighterActionsFn(db, fighters),
    listByFighterID: generateListByFighterIDFn(db),
    listStaleBefore: generateListStaleBeforeFn(db),
    remove: generateRemoveFn(db, 'fighter_actions'),
    touch: generateTouchFn(db),
  };
}

function generateListByFighterIDFn(db) {
  return (fighterID) => db('fighter_actions')
    .where({fighter: fighterID})
    .orderBy('created_at');
}

function generateListFighterActionsFn(db, fighters) {
  return async (playerID) => {
    const currentFighter = await fighters.findCurrentByPlayerID(playerID);
    if(!currentFighter) {
      return [];
    }
    return db('fighter_actions')
      .where({fighter: currentFighter.id})
      .orderBy('created_at');
  };
}

function generateListStaleBeforeFn(db) {
  return (staleBefore) => db('fighter_actions')
    .select('fighter')
    .where('touched_at', '<=', staleBefore)
    .orderBy('touched_at');
}

function generateTouchFn(db) {
  return (id, touchedAt = null) => db('fighter_actions')
    .where({id})
    .update({touched_at: touchedAt || db.fn.now()})
    .returning('*')
    .then((rows) => rows[0]);
}
