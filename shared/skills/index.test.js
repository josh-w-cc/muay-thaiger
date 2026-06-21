import {deepEqual, equal} from 'node:assert/strict';
import {describe, it} from 'node:test';

import {SKILL_DEFINITIONS} from './definitions.js';
import {SKILL_IDS} from './ids.js';
import {SKILLS_BY_ACTION_ID, SKILL_SEED_ACTIONS} from './index.js';


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
      SKILL_SEED_ACTIONS.toSorted((left, right) => left.id - right.id),
      [
        {id: SKILL_IDS.begging, name: '฿egging', type: 'train'},
        {id: SKILL_IDS.walking, name: 'Walking', type: 'train'},
        {id: SKILL_IDS.shadowBoxing, name: 'Shadow Boxing', type: 'train'},
        {id: SKILL_IDS.breathwork, name: 'Breathwork', type: 'train'},
        {id: SKILL_IDS.yoga, name: 'Yoga', type: 'train'},
        {id: SKILL_IDS.calisthenics, name: 'Calisthenics', type: 'train'},
        {id: SKILL_IDS.laboring, name: 'La฿oring', type: 'train'},
        {id: SKILL_IDS.running, name: 'Running', type: 'train'},
        {id: SKILL_IDS.gymnastics, name: 'Gymnastics', type: 'train'},
      ],
    );
  });
});

describe('SKILL_DEFINITIONS', () => {
  it('applies each skill action to fighter stats and gold', () => {
    const calls = [];
    const fighter = {
      train: (stat, amount = 1) => calls.push(['train', stat, amount]),
      win: (amount) => calls.push(['win', amount]),
    };

    for(const skillID of Object.values(SKILL_IDS).toSorted((left, right) => left - right)) {
      SKILLS_BY_ACTION_ID[skillID].action(fighter);
    }

    deepEqual(calls, [
      ['win', 1n],
      ['train', 'stamina', 1],
      ['train', 'stamina', 3n],
      ['train', 'constitution', 1],
      ['train', 'stamina', 1],
      ['train', 'agility', 1],
      ['train', 'strength', 1],
      ['train', 'constitution', 1],
      ['train', 'stamina', 5n],
      ['train', 'strength', 3n],
      ['train', 'constitution', 1n],
      ['win', 100n],
      ['train', 'stamina', 1n],
      ['train', 'strength', 1n],
      ['train', 'constitution', 1n],
      ['train', 'stamina', 25n],
      ['train', 'stamina', 5n],
      ['train', 'strength', 5n],
      ['train', 'constitution', 1n],
      ['train', 'agility', 15n],
    ]);
  });

  it('checks skill requirements at each threshold', () => {
    equal(SKILL_DEFINITIONS.begging.requires({}), true);
    equal(SKILL_DEFINITIONS.walking.requires({}), true);

    equal(SKILL_DEFINITIONS.shadowBoxing.requires({stamina: 0n}), false);
    equal(SKILL_DEFINITIONS.shadowBoxing.requires({stamina: 25n}), false);
    equal(SKILL_DEFINITIONS.shadowBoxing.requires({stamina: 26n}), true);

    equal(SKILL_DEFINITIONS.breathwork.requires({stamina: 0n}), false);
    equal(SKILL_DEFINITIONS.breathwork.requires({stamina: 50n}), false);
    equal(SKILL_DEFINITIONS.breathwork.requires({stamina: 51n}), true);

    equal(SKILL_DEFINITIONS.yoga.requires({constitution: 2n, stamina: 100n}), false);
    equal(SKILL_DEFINITIONS.yoga.requires({constitution: 2n, stamina: 101n}), true);

    equal(SKILL_DEFINITIONS.calisthenics.requires({constitution: 11n, stamina: 251n, strength: 25n}), false);
    equal(SKILL_DEFINITIONS.calisthenics.requires({constitution: 11n, stamina: 251n, strength: 26n}), true);

    equal(SKILL_DEFINITIONS.laboring.requires({constitution: 101n, stamina: 501n, strength: 100n}), false);
    equal(SKILL_DEFINITIONS.laboring.requires({constitution: 101n, stamina: 501n, strength: 101n}), true);

    equal(SKILL_DEFINITIONS.running.requires({constitution: 250n, stamina: 1001n}), false);
    equal(SKILL_DEFINITIONS.running.requires({constitution: 251n, stamina: 1001n}), true);

    equal(SKILL_DEFINITIONS.gymnastics.requires({agility: 500n, stamina: 2501n, strength: 251n}), false);
    equal(SKILL_DEFINITIONS.gymnastics.requires({agility: 501n, stamina: 2501n, strength: 251n}), true);
  });
});
