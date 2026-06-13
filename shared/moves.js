import {createSeedEntries} from './seedData.js';

export const MOVE_IDS = Object.freeze({
  wildPunch: 1,
  wildKick: 2,
});

export const MOVE_DEFINITIONS = Object.freeze({
  wildPunch: {
    affect: (_fighter, opponent) => {
      opponent.takeDamage(Math.floor(Math.random() * 5) + 1);
    },
    recovery: 3,
    staminaCost: 10,
    name: 'Wild Punch',
  },
  wildKick: {
    affect: (_fighter, opponent) => {
      opponent.takeDamage(Math.floor(Math.random() * 10) + 1);
    },
    recovery: 5,
    staminaCost: 20,
    name: 'Wild Kick',
  },
});

export const MOVE_DEFINITIONS_BY_ID = Object.freeze(
  Object.fromEntries(
    Object.entries(MOVE_IDS)
      .map(([name, id]) => [id, MOVE_DEFINITIONS[name]])
      .filter(([, moveDefinition]) => Boolean(moveDefinition)),
  ),
);

export const MOVE_SEED_MOVES = createSeedEntries(MOVE_DEFINITIONS, MOVE_IDS);
