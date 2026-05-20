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
  },
  walking: {
    action: (fighter) => {
      fighter.train('stamina');
    },
    name: 'Walking',
    requires: () => true,
  },
  shadowBoxing: {
    action: (fighter) => {
      fighter.train('stamina', 2);
    },
    name: 'Shadow Boxing',
    requires: (fighter) => fighter.stamina > 50,
  },
  breathwork: {
    action: (fighter) => {
      fighter.train('constitution');
      fighter.train('stamina');
    },
    name: 'Breathwork',
    requires: (fighter) => fighter.stamina > 50,
  },
  yoga: {
    action: (fighter) => {
      fighter.train('agility');
      fighter.train('strength');
      fighter.train('constitution');
    },
    name: 'Yoga',
    requires: (fighter) => fighter.stamina > 100,
  },
  calisthenics: {
    action: (fighter) => {
      fighter.train('stamina', 10);
      fighter.train('strength', 7);
      fighter.train('constitution', 5);
    },
    name: 'Calisthenics',
    requires: (fighter) => fighter.stamina > 1000 && fighter.constitution > 100 && fighter.strength > 100,
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
  },
  running: {
    action: (fighter) => {
      fighter.train('stamina', 125);
    },
    name: 'Running',
    requires: (fighter) => fighter.stamina > 10000 && fighter.constitution > 100,
  },
  gymnastics: {
    action: (fighter) => {
      fighter.train('stamina', 15);
      fighter.train('strength', 15);
      fighter.train('constitution', 5);
      fighter.train('agility', 25);
    },
    name: 'Gymnastics',
    requires: (fighter) => fighter.stamina > 10000 && fighter.strength > 1000 && fighter.constitution > 1000 && fighter.agility > 1000,
  },
});

export const SKILL_SEED_ACTIONS = Object.freeze(
  Object.entries(SKILL_DEFINITIONS).map(([key, skill]) => ({id: SKILL_IDS[key], name: skill.name, type: 'train'})),
);
