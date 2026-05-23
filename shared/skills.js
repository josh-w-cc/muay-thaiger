export const SKILL_IDS = Object.freeze({
  begging: 1,
  breathwork: 4,
  calisthenics: 6,
  gymnastics: 9,
  laboring: 7,
  running: 8,
  shadowBoxing: 3,
  walking: 2,
  yoga: 5,
});

export const SKILL_DEFINITIONS = Object.freeze({
  begging: {
    action: (fighter) => {
      fighter.win(1);
    },
    name: '฿egging',
    requires: () => true,
    duration: 1,
  },
  walking: {
    action: (fighter) => {
      fighter.train('stamina');
    },
    name: 'Walking',
    requires: () => true,
    duration: 1,
  },
  shadowBoxing: {
    action: (fighter) => {
      fighter.train('stamina', 3);
    },
    name: 'Shadow Boxing',
    requires: (fighter) => fighter.stamina > 50,
    duration: 2,
  },
  breathwork: {
    action: (fighter) => {
      fighter.train('constitution');
      fighter.train('stamina');
    },
    name: 'Breathwork',
    requires: (fighter) => fighter.stamina > 50,
    duration: 2,
  },
  yoga: {
    action: (fighter) => {
      fighter.train('agility');
      fighter.train('strength');
      fighter.train('constitution');
    },
    name: 'Yoga',
    requires: (fighter) => fighter.stamina > 100,
    duration: 2,
  },
  calisthenics: {
    action: (fighter) => {
      fighter.train('stamina', 5);
      fighter.train('strength', 3);
      fighter.train('constitution', 1);
    },
    name: 'Calisthenics',
    requires: (fighter) => fighter.stamina > 1000 && fighter.constitution > 100 && fighter.strength > 100,
    duration: 4,
  },
  laboring: {
    action: (fighter) => {
      fighter.win(100);
      fighter.train('stamina', 1);
      fighter.train('strength', 1);
      fighter.train('constitution', 1);
    },
    name: 'La฿oring',
    requires: (fighter) => fighter.stamina > 1000 && fighter.constitution > 1000 && fighter.strength > 1000,
    duration: 4,
  },
  running: {
    action: (fighter) => {
      fighter.train('stamina', 25);
    },
    name: 'Running',
    requires: (fighter) => fighter.stamina > 10000 && fighter.constitution > 100,
    duration: 8,
  },
  gymnastics: {
    action: (fighter) => {
      fighter.train('stamina', 5);
      fighter.train('strength', 5);
      fighter.train('constitution', 1);
      fighter.train('agility', 15);
    },
    name: 'Gymnastics',
    requires: (fighter) => fighter.stamina > 10000 && fighter.strength > 1000 && fighter.constitution > 1000 && fighter.agility > 1000,
    duration: 8,
  },
});

export const SKILL_SEED_ACTIONS = Object.freeze(
  Object.entries(SKILL_DEFINITIONS).map(([key, skill]) => ({id: SKILL_IDS[key], name: skill.name, type: 'train'})),
);
