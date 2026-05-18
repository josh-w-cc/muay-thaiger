import fightersModel from './fighters.js';
import {
  generateCreateFn,
  generateFindFn,
  generateRemoveFn,
} from '../utils/crud.js';


export default function characterActions(db) {
  const fighters = fightersModel(db);
  return {
    create: generateCreateFn(db, 'fighter_actions'),
    find: generateFindFn(db, 'fighter_actions'),
    list: generateListCharacterActionsFn(db, fighters),
    remove: generateRemoveFn(db, 'fighter_actions'),
  };
}

function generateListCharacterActionsFn(db, fighters) {
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
