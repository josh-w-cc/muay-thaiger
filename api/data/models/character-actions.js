import {
  generateCreateFn,
  generateFindFn,
  generateRemoveFn,
} from '../utils/crud.js';


export default function characterActions(db) {
  return {
    create: generateCreateFn(db, 'character_actions'),
    find: generateFindFn(db, 'character_actions'),
    list: generateListCharacterActionsFn(db),
    remove: generateRemoveFn(db, 'character_actions'),
  };
}

function generateListCharacterActionsFn(db) {
  return async (playerID) => {
    const currentCharacter = await db('characters')
      .where({player_id: playerID, retired: false})
      .orderBy('created_at', 'desc')
      .first();
    if(!currentCharacter) {
      return [];
    }
    return db('character_actions')
      .where({character_id: currentCharacter.id})
      .orderBy('created_at');
  };
}
