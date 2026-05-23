import {deepEqual, equal} from 'node:assert/strict';
import {describe, it} from 'node:test';

import {SKILL_DEFINITIONS, SKILL_IDS, SKILL_SEED_ACTIONS} from './skills.js';


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

describe('SKILL_SEED_ACTIONS', () => {
  it('creates action seed data from the shared skill definitions', () => {
    deepEqual(SKILL_SEED_ACTIONS, [
      {id: SKILL_IDS.begging, name: '฿egging', type: 'train'},
      {id: SKILL_IDS.walking, name: 'Walking', type: 'train'},
      {id: SKILL_IDS.shadowBoxing, name: 'Shadow Boxing', type: 'train'},
      {id: SKILL_IDS.breathwork, name: 'Breathwork', type: 'train'},
      {id: SKILL_IDS.yoga, name: 'Yoga', type: 'train'},
      {id: SKILL_IDS.calisthenics, name: 'Calisthenics', type: 'train'},
      {id: SKILL_IDS.laboring, name: 'La฿oring', type: 'train'},
      {id: SKILL_IDS.running, name: 'Running', type: 'train'},
      {id: SKILL_IDS.gymnastics, name: 'Gymnastics', type: 'train'},
    ]);
  });
});

describe('SKILL_DEFINITIONS', () => {
  it('applies each skill action to fighter stats and gold', () => {
    const calls = [];
    const fighter = {
      train: (stat, amount = 1) => calls.push(['train', stat, amount]),
      win: (amount) => calls.push(['win', amount]),
    };

    for(const skill of Object.values(SKILL_DEFINITIONS)) {
      skill.action(fighter);
    }

    deepEqual(calls, [
      ['win', 1],
      ['train', 'stamina', 1],
      ['train', 'stamina', 3],
      ['train', 'constitution', 1],
      ['train', 'stamina', 1],
      ['train', 'agility', 1],
      ['train', 'strength', 1],
      ['train', 'constitution', 1],
      ['train', 'stamina', 5],
      ['train', 'strength', 3],
      ['train', 'constitution', 1],
      ['win', 100],
      ['train', 'stamina', 1],
      ['train', 'strength', 1],
      ['train', 'constitution', 1],
      ['train', 'stamina', 25],
      ['train', 'stamina', 5],
      ['train', 'strength', 5],
      ['train', 'constitution', 1],
      ['train', 'agility', 15],
    ]);
  });

  it('checks skill requirements at each threshold', () => {
    equal(SKILL_DEFINITIONS.begging.requires({}), true);
    equal(SKILL_DEFINITIONS.walking.requires({}), true);

    equal(SKILL_DEFINITIONS.shadowBoxing.requires({stamina: 0}), false);
    equal(SKILL_DEFINITIONS.shadowBoxing.requires({stamina: 50}), false);
    equal(SKILL_DEFINITIONS.shadowBoxing.requires({stamina: 51}), true);

    equal(SKILL_DEFINITIONS.breathwork.requires({stamina: 0}), false);
    equal(SKILL_DEFINITIONS.breathwork.requires({stamina: 50}), false);
    equal(SKILL_DEFINITIONS.breathwork.requires({stamina: 51}), true);

    equal(SKILL_DEFINITIONS.yoga.requires({constitution: 2, stamina: 100}), false);
    equal(SKILL_DEFINITIONS.yoga.requires({constitution: 2, stamina: 101}), true);

    equal(SKILL_DEFINITIONS.calisthenics.requires({constitution: 101, stamina: 1001, strength: 100}), false);
    equal(SKILL_DEFINITIONS.calisthenics.requires({constitution: 101, stamina: 1001, strength: 101}), true);

    equal(SKILL_DEFINITIONS.laboring.requires({constitution: 1001, stamina: 1001, strength: 1000}), false);
    equal(SKILL_DEFINITIONS.laboring.requires({constitution: 1001, stamina: 1001, strength: 1001}), true);

    equal(SKILL_DEFINITIONS.running.requires({constitution: 101, stamina: 10000}), false);
    equal(SKILL_DEFINITIONS.running.requires({constitution: 101, stamina: 10001}), true);

    equal(SKILL_DEFINITIONS.gymnastics.requires({agility: 1000, constitution: 1001, stamina: 10001, strength: 1001}), false);
    equal(SKILL_DEFINITIONS.gymnastics.requires({agility: 1001, constitution: 1000, stamina: 10001, strength: 1001}), false);
    equal(SKILL_DEFINITIONS.gymnastics.requires({agility: 1001, constitution: 1001, stamina: 10000, strength: 1001}), false);
    equal(SKILL_DEFINITIONS.gymnastics.requires({agility: 1001, constitution: 1001, stamina: 10001, strength: 1000}), false);
    equal(SKILL_DEFINITIONS.gymnastics.requires({agility: 1001, constitution: 1001, stamina: 10001, strength: 1001}), true);
  });
});
