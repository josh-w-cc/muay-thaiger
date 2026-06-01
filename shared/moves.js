import {createSeedEntries} from './seedData.js';

export const MOVE_IDS = Object.freeze({
  wildPunch: 1,
  wildKick: 2,
});

export const MOVE_DEFINITIONS = Object.freeze({
  wildPunch: {
    affect: (opponent) => {
      opponent.takeDamage(2);
    },
    recovery: 3,
    name: 'Wild Punch',
  },
  wildKick: {
    affect: (opponent) => {
      opponent.takeDamage(3);
    },
    recovery: 5,
    name: 'Wild Kick',
  },
});

export const MOVE_SEED_MOVES = createSeedEntries(MOVE_DEFINITIONS, MOVE_IDS);
