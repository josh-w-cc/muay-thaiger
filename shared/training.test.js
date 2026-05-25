import {deepEqual, equal} from 'node:assert/strict';
import {describe, it} from 'node:test';

import {applyTrainingAction, getTrainedStatValue, getTrainingDurationMs, getTrainingEffect} from './training.js';


describe('applyTrainingAction', () => {
  it('applies the shared skill definition for the given action', () => {
    const calls = [];
    const fighter = {
      train: (stat, multiplier = 1) => calls.push(['train', stat, multiplier]),
      win: (amount) => calls.push(['win', amount]),
    };

    applyTrainingAction({action_id: 7}, fighter);

    deepEqual(calls, [
      ['win', 100],
      ['train', 'stamina', 1],
      ['train', 'strength', 1],
      ['train', 'constitution', 1],
    ]);
  });

  it('ignores unknown action ids', () => {
    const fighter = {
      train: () => {
        throw new Error('should not train');
      },
      win: () => {
        throw new Error('should not win');
      },
    };

    applyTrainingAction({action_id: 999}, fighter);
  });
});

describe('getTrainingDurationMs', () => {
  it('returns the shared skill duration in milliseconds', () => {
    equal(getTrainingDurationMs({action_id: 6}), 4000);
  });

  it('returns zero for unknown action ids', () => {
    equal(getTrainingDurationMs({action_id: 999}), 0);
  });
});

describe('getTrainingEffect', () => {
  it('maps base stats to training multipliers', () => {
    deepEqual(getTrainingEffect({anima: 2, speed: 3, vigor: 5, vitality: 7}), {
      agility: 3n,
      constitution: 7n,
      skill: 2n,
      stamina: 7n,
      strength: 5n,
    });
  });
});

describe('getTrainedStatValue', () => {
  it('returns the next trained stat value from fighter stats', () => {
    equal(getTrainedStatValue({stamina: 3, vitality: 7}, 'stamina', 2), 17n);
  });

  it('uses zero when the trained stat has not been initialized', () => {
    equal(getTrainedStatValue({vitality: 7}, 'stamina', 2), 14n);
  });

  it('returns null for unknown training stats', () => {
    equal(getTrainedStatValue({vitality: 7}, 'charisma'), null);
  });
});
