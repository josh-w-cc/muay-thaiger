import {deepEqual, equal} from 'node:assert/strict';
import {describe, it} from 'node:test';

import {SKILL_DEFINITIONS, SKILL_IDS, SKILLS_BY_ACTION_ID, SKILL_SEED_ACTIONS} from './skills.js';

const EXPECTED_SKILL_ACTION_CALLS = {
  begging: [
    ['win', 1],
  ],
  breathwork: [
    ['train', 'constitution', 1],
    ['train', 'stamina', 1],
  ],
  calisthenics: [
    ['train', 'stamina', 5],
    ['train', 'strength', 3],
    ['train', 'constitution', 1],
  ],
  gymnastics: [
    ['train', 'stamina', 5],
    ['train', 'strength', 5],
    ['train', 'constitution', 1],
    ['train', 'agility', 15],
  ],
  laboring: [
    ['win', 100],
    ['train', 'stamina', 1],
    ['train', 'strength', 1],
    ['train', 'constitution', 1],
  ],
  running: [
    ['train', 'stamina', 25],
  ],
  shadowBoxing: [
    ['train', 'stamina', 3],
  ],
  walking: [
    ['train', 'stamina', 1],
  ],
  yoga: [
    ['train', 'agility', 1],
    ['train', 'strength', 1],
    ['train', 'constitution', 1],
  ],
};


describe('SKILL_IDS', () => {
  it('defines the expected ids for all train skills', () => {
    deepEqual(SKILL_IDS, {
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
  });
});

describe('SKILLS_BY_ACTION_ID', () => {
  it('maps each action id to its skill definition', () => {
    for(const [key, id] of Object.entries(SKILL_IDS)) {
      equal(SKILLS_BY_ACTION_ID[id], SKILL_DEFINITIONS[key]);
    }
  });
});

describe('SKILL_SEED_ACTIONS', () => {
  it('creates action seed data from the shared skill definitions', () => {
    deepEqual(
      SKILL_SEED_ACTIONS,
      Object.entries(SKILL_DEFINITIONS).map(([key, skill]) => ({id: SKILL_IDS[key], name: skill.name, type: 'train'})),
    );
  });
});

describe('SKILL_DEFINITIONS', () => {
  it('applies each skill action to fighter stats and gold', () => {
    for(const [key, skill] of Object.entries(SKILL_DEFINITIONS)) {
      const calls = [];
      const fighter = {
        train: (stat, amount = 1) => calls.push(['train', stat, amount]),
        win: (amount) => calls.push(['win', amount]),
      };
      skill.action(fighter);

      deepEqual(calls, EXPECTED_SKILL_ACTION_CALLS[key]);
    }
  });

  it('checks skill requirements at each threshold', () => {
    equal(SKILL_DEFINITIONS.begging.requires({}), true);
    equal(SKILL_DEFINITIONS.walking.requires({}), true);

    equal(SKILL_DEFINITIONS.shadowBoxing.requires({stamina: 0}), false);
    equal(SKILL_DEFINITIONS.shadowBoxing.requires({stamina: 25}), false);
    equal(SKILL_DEFINITIONS.shadowBoxing.requires({stamina: 26}), true);

    equal(SKILL_DEFINITIONS.breathwork.requires({stamina: 0}), false);
    equal(SKILL_DEFINITIONS.breathwork.requires({stamina: 50}), false);
    equal(SKILL_DEFINITIONS.breathwork.requires({stamina: 51}), true);

    equal(SKILL_DEFINITIONS.yoga.requires({constitution: 2, stamina: 100}), false);
    equal(SKILL_DEFINITIONS.yoga.requires({constitution: 2, stamina: 101}), true);

    equal(SKILL_DEFINITIONS.calisthenics.requires({constitution: 11, stamina: 251, strength: 25}), false);
    equal(SKILL_DEFINITIONS.calisthenics.requires({constitution: 11, stamina: 251, strength: 26}), true);

    equal(SKILL_DEFINITIONS.laboring.requires({constitution: 101, stamina: 501, strength: 100}), false);
    equal(SKILL_DEFINITIONS.laboring.requires({constitution: 101, stamina: 501, strength: 101}), true);

    equal(SKILL_DEFINITIONS.running.requires({constitution: 250, stamina: 1001}), false);
    equal(SKILL_DEFINITIONS.running.requires({constitution: 251, stamina: 1001}), true);

    equal(SKILL_DEFINITIONS.gymnastics.requires({agility: 500, stamina: 2501, strength: 251}), false);
    equal(SKILL_DEFINITIONS.gymnastics.requires({agility: 501, stamina: 2501, strength: 251}), true);
  });
});
