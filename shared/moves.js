import {createSeedEntries} from './seedData.js';

export const MOVE_IDS = Object.freeze({
  wildPunch: 1,
  wildKick: 2,
});

export const MOVE_DEFINITIONS = Object.freeze({
  wildPunch: {
    affect: (_fighter, opponent) => {
      opponent.takeDamage(1);
    },
    recovery: 3,
    staminaCost: 10,
    name: 'Wild Punch',
  },
  wildKick: {
    affect: (_fighter, opponent) => {
      opponent.takeDamage(2);
    },
    recovery: 5,
    staminaCost: 20,
    name: 'Wild Kick',
  },
});

export const MOVE_SEED_MOVES = createSeedEntries(MOVE_DEFINITIONS, MOVE_IDS);
