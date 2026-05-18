import charactersModel from './characters.js';
import {
  generateCreateFn,
  generateFindFn,
  generateRemoveFn,
} from '../utils/crud.js';


export default function characterActions(db) {
  const characters = charactersModel(db);
  return {
    create: generateCreateFn(db, 'character_actions'),
    find: generateFindFn(db, 'character_actions'),
    list: generateListCharacterActionsFn(db, characters),
    remove: generateRemoveFn(db, 'character_actions'),
  };
}

function generateListCharacterActionsFn(db, characters) {
  return async (playerId) => {
    const currentCharacter = await characters.findCurrentByPlayerID(playerId);
    if(!currentCharacter) {
      return [];
    }
    return db('character_actions')
      .where({character_id: currentCharacter.id})
      .orderBy('created_at');
  };
}
