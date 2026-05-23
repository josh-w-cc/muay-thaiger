export const MOVE_IDS = Object.freeze({
  wildPunch: 1,
  wildKick: 2,
});

export const MOVE_DEFINITIONS = Object.freeze({
  wildPunch: {
    affect: (opponent) => {
      opponent.takeDamage(2);
    },
    duration: 1,
    name: 'Wild Punch',
  },
  wildKick: {
    affect: (opponent) => {
      opponent.takeDamage(3);
    },
    duration: 2,
    name: 'Wild Kick',
  },
});

export const MOVE_SEED_MOVES = Object.freeze(
  Object.entries(MOVE_DEFINITIONS).map(([key, move]) => ({
    id: MOVE_IDS[key],
    name: move.name,
  })),
);
