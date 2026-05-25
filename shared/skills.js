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
      fighter.train('stamina', 5);
      fighter.train('strength', 5);
      fighter.train('constitution', 1);
      fighter.train('agility', 15);
    },
    name: 'Gymnastics',
    requires: (fighter) => fighter.stamina > 2500n && fighter.strength > 250n && fighter.agility > 500n,
    duration: 8,
  },
  running: {
    action: (fighter) => {
      fighter.train('stamina', 25);
    },
    name: 'Running',
    requires: (fighter) => fighter.stamina > 1000n && fighter.constitution > 250n,
    duration: 8,
  },
  laboring: {
    action: (fighter) => {
      fighter.win(100);
      fighter.train('stamina', 1);
      fighter.train('strength', 1);
      fighter.train('constitution', 1);
    },
    name: 'La฿oring',
    requires: (fighter) => fighter.stamina > 500n && fighter.constitution > 100n && fighter.strength > 100n,
    duration: 4,
  },
  calisthenics: {
    action: (fighter) => {
      fighter.train('stamina', 5);
      fighter.train('strength', 3);
      fighter.train('constitution', 1);
    },
    name: 'Calisthenics',
    requires: (fighter) => fighter.stamina > 250n && fighter.constitution > 10n && fighter.strength > 25n,
    duration: 4,
  },
  yoga: {
    action: (fighter) => {
      fighter.train('agility');
      fighter.train('strength');
      fighter.train('constitution');
    },
    name: 'Yoga',
    requires: (fighter) => fighter.stamina > 100n,
    duration: 2,
  },
  breathwork: {
    action: (fighter) => {
      fighter.train('constitution');
      fighter.train('stamina');
    },
    name: 'Breathwork',
    requires: (fighter) => fighter.stamina > 50n,
    duration: 2,
  },
  shadowBoxing: {
    action: (fighter) => {
      fighter.train('stamina', 3);
    },
    name: 'Shadow Boxing',
    requires: (fighter) => fighter.stamina > 25n,
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
