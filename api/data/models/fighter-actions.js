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
    remove: generateRemoveFn(db, 'fighter_actions'),
    touch: generateTouchFn(db),
  };
}

function generateListByFighterIDFn(db) {
  return (fighterId) => db('fighter_actions')
    .where({fighter_id: fighterId})
    .orderBy('created_at');
}

function generateListFighterActionsFn(db, fighters) {
  return async (playerId) => {
    const currentFighter = await fighters.findCurrentByPlayerID(playerId);
    if(!currentFighter) {
      return [];
    }
    return db('fighter_actions')
      .where({fighter_id: currentFighter.id})
      .orderBy('created_at');
  };
}

function generateTouchFn(db) {
  return (id) => db('fighter_actions')
    .where({id})
    .update({touched_at: db.fn.now()})
    .returning('*')
    .then((rows) => rows[0]);
}
