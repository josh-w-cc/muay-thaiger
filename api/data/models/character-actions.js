import fightersModel from './fighters.js';
import {
  generateCreateFn,
  generateFindFn,
  generateRemoveFn,
} from '../utils/crud.js';


export default function characterActions(db) {
  const fighters = fightersModel(db);
  return {
    create: generateCreateFn(db, 'character_actions'),
    find: generateFindFn(db, 'character_actions'),
    list: generateListCharacterActionsFn(db, fighters),
    remove: generateRemoveFn(db, 'character_actions'),
  };
}

function generateListCharacterActionsFn(db, fighters) {
  return async (playerId) => {
    const currentFighter = await fighters.findCurrentByPlayerID(playerId);
    if(!currentFighter) {
      return [];
    }
    return db('character_actions')
      .where({character_id: currentFighter.id})
      .orderBy('created_at');
  };
}
