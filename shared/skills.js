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
  beg: {
    action: (fighter) => {
      fighter.win(1);
    },
    id: SKILL_IDS.begging,
    name: '฿egging',
    requires: () => true,
  },
  walk: {
    action: (fighter) => {
      fighter.train('stamina');
    },
    id: SKILL_IDS.walking,
    name: 'Walking',
    requires: () => true,
  },
  shadowbox: {
    action: (fighter) => {
      fighter.train('stamina', 2);
    },
    id: SKILL_IDS.shadowBoxing,
    name: 'Shadow Boxing',
    requires: (fighter) => fighter.stamina > 50,
  },
  breathwork: {
    action: (fighter) => {
      fighter.train('constitution');
      fighter.train('stamina');
    },
    id: SKILL_IDS.breathwork,
    name: 'Breathwork',
    requires: (fighter) => fighter.stamina > 50,
  },
  yoga: {
    action: (fighter) => {
      fighter.train('agility');
      fighter.train('strength');
      fighter.train('constitution');
    },
    id: SKILL_IDS.yoga,
    name: 'Yoga',
    requires: (fighter) => fighter.stamina > 100 && fighter.constitution > 1,
  },
  calisthenics: {
    action: (fighter) => {
      fighter.train('stamina', 10);
      fighter.train('strength', 7);
      fighter.train('constitution', 5);
    },
    id: SKILL_IDS.calisthenics,
    name: 'Calisthenics',
    requires: (fighter) => fighter.stamina > 1000 && fighter.constitution > 100 && fighter.strength > 100,
  },
  labor: {
    action: (fighter) => {
      fighter.win(100);
      fighter.train('stamina', 1);
      fighter.train('strength', 1);
      fighter.train('constitution', 1);
    },
    id: SKILL_IDS.laboring,
    name: 'La฿oring',
    requires: (fighter) => fighter.stamina > 1000 && fighter.constitution > 1000 && fighter.strength > 1000,
  },
  run: {
    action: (fighter) => {
      fighter.train('stamina', 125);
    },
    id: SKILL_IDS.running,
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
    id: SKILL_IDS.gymnastics,
    name: 'Gymnastics',
    requires: (fighter) => fighter.stamina > 10000 && fighter.strength > 1000 && fighter.constitution > 1000 && fighter.agility > 1000,
  },
});

export const SKILL_SEED_ACTIONS = Object.freeze(
  Object.values(SKILL_DEFINITIONS).map((skill) => ({id: skill.id, name: skill.name, type: 'train'})),
);
