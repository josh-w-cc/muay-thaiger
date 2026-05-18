import fightersModel from './fighters.js';
import {
  generateCreateFn,
  generateFindFn,
  generateRemoveFn,
} from '../utils/crud.js';


export default function characterActions(db) {
  const characters = fightersModel(db);
  return {
    create: generateCreateFn(db, 'fighter_actions'),
    find: generateFindFn(db, 'fighter_actions'),
    list: generateListCharacterActionsFn(db, characters),
    remove: generateRemoveFn(db, 'fighter_actions'),
  };
}

function generateListCharacterActionsFn(db, characters) {
  return async (playerId) => {
    const currentCharacter = await characters.findCurrentByPlayerID(playerId);
    if(!currentCharacter) {
      return [];
    }
    return db('fighter_actions')
      .where({character_id: currentCharacter.id})
      .orderBy('created_at');
  };
}
