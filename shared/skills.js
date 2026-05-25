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
  gymnastics: {
    action: (fighter) => {
      fighter.train('stamina', 5n);
      fighter.train('strength', 5n);
      fighter.train('constitution', 1n);
      fighter.train('agility', 15n);
    },
    name: 'Gymnastics',
    requires: (fighter) => fighter.stamina > 2500 && fighter.strength > 250 && fighter.agility > 500,
    duration: 8,
  },
  running: {
    action: (fighter) => {
      fighter.train('stamina', 25n);
    },
    name: 'Running',
    requires: (fighter) => fighter.stamina > 1000 && fighter.constitution > 250,
    duration: 8,
  },
  laboring: {
    action: (fighter) => {
      fighter.win(100);
      fighter.train('stamina', 1n);
      fighter.train('strength', 1n);
      fighter.train('constitution', 1n);
    },
    name: 'La฿oring',
    requires: (fighter) => fighter.stamina > 500 && fighter.constitution > 100 && fighter.strength > 100,
    duration: 4,
  },
  calisthenics: {
    action: (fighter) => {
      fighter.train('stamina', 5n);
      fighter.train('strength', 3n);
      fighter.train('constitution', 1n);
    },
    name: 'Calisthenics',
    requires: (fighter) => fighter.stamina > 250 && fighter.constitution > 10 && fighter.strength > 25,
    duration: 4,
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
  breathwork: {
    action: (fighter) => {
      fighter.train('constitution');
      fighter.train('stamina');
    },
    name: 'Breathwork',
    requires: (fighter) => fighter.stamina > 50,
    duration: 2,
  },
  shadowBoxing: {
    action: (fighter) => {
      fighter.train('stamina', 3n);
    },
    name: 'Shadow Boxing',
    requires: (fighter) => fighter.stamina > 25,
    duration: 2,
  },
  walking: {
    action: (fighter) => {
      fighter.train('stamina');
    },
    name: 'Walking',
    requires: () => true,
    duration: 1,
  },
  begging: {
    action: (fighter) => {
      fighter.win(1);
    },
    name: '฿egging',
    requires: () => true,
    duration: 1,
  },
});

export const SKILLS_BY_ACTION_ID = Object.freeze(Object.fromEntries(Object.entries(SKILL_IDS).map(([key, id]) => [id, SKILL_DEFINITIONS[key]])));

export const SKILL_SEED_ACTIONS = Object.freeze(
  Object.entries(SKILL_DEFINITIONS).map(([key, skill]) => ({id: SKILL_IDS[key], name: skill.name, type: 'train'})),
);
