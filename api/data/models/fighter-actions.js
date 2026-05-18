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
    remove: generateRemoveFn(db, 'fighter_actions'),
  };
}

function generateListFighterActionsFn(db, fighters) {
  return async (playerId) => {
    const currentFighter = await fighters.findCurrentByPlayerID(playerId);
    if(!currentFighter) {
      return [];
    }
    return db('fighter_actions')
      .where({character_id: currentFighter.id})
      .orderBy('created_at');
  };
}
