import {createSeedEntries} from './seedData.js';

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
    name: 'Gymnastics', description: 'Increases stamina, strength, constitution, and agility.',
    requires: (fighter) => fighter.stamina > 2500n && fighter.strength > 250n && fighter.agility > 500n,
    duration: 8,
  },
  running: {
    action: (fighter) => {
      fighter.train('stamina', 25n);
    },
    name: 'Running', description: 'Greatly increases stamina.',
    requires: (fighter) => fighter.stamina > 1000n && fighter.constitution > 250n,
    duration: 8,
  },
  laboring: {
    action: (fighter) => {
      fighter.win(100n);
      fighter.train('stamina', 1n);
      fighter.train('strength', 1n);
      fighter.train('constitution', 1n);
    },
    name: 'La฿oring', description: 'Increases gold, stamina, strength, and constitution.',
    requires: (fighter) => fighter.stamina > 500n && fighter.constitution > 100n && fighter.strength > 100n,
    duration: 4,
  },
  calisthenics: {
    action: (fighter) => {
      fighter.train('stamina', 5n);
      fighter.train('strength', 3n);
      fighter.train('constitution', 1n);
    },
    name: 'Calisthenics', description: 'Increases stamina, strength, and constitution.',
    requires: (fighter) => fighter.stamina > 250n && fighter.constitution > 10n && fighter.strength > 25n,
    duration: 4,
  },
  yoga: {
    action: (fighter) => {
      fighter.train('agility');
      fighter.train('strength');
      fighter.train('constitution');
    },
    name: 'Yoga', description: 'Increases agility, strength, and constitution.',
    requires: (fighter) => fighter.stamina > 100n,
    duration: 2,
  },
  breathwork: {
    action: (fighter) => {
      fighter.train('constitution');
      fighter.train('stamina');
    },
    name: 'Breathwork', description: 'Increases constitution and stamina.',
    requires: (fighter) => fighter.stamina > 50n,
    duration: 2,
  },
  shadowBoxing: {
    action: (fighter) => {
      fighter.train('stamina', 3n);
    },
    name: 'Shadow Boxing', description: 'Increases stamina.',
    requires: (fighter) => fighter.stamina > 25n,
    duration: 2,
  },
  walking: {
    action: (fighter) => {
      fighter.train('stamina');
    },
    name: 'Walking', description: 'Increases stamina.',
    requires: () => true,
    duration: 1,
  },
  begging: {
    action: (fighter) => {
      fighter.win(1n);
    },
    name: '฿egging', description: 'Increases gold.',
    requires: () => true,
    duration: 1,
  },
});

export const SKILLS_BY_ACTION_ID = Object.freeze(Object.fromEntries(Object.entries(SKILL_IDS).map(([key, id]) => [id, SKILL_DEFINITIONS[key]])));

export const SKILL_SEED_ACTIONS = createSeedEntries(SKILL_DEFINITIONS, SKILL_IDS, () => ({type: 'train'}));
