import {deepEqual, equal} from 'node:assert/strict';
import {describe, it} from 'node:test';

import {getTrainedStatValue, getTrainingEffect} from './training.js';


describe('getTrainingEffect', () => {
  it('maps base stats to training multipliers', () => {
    deepEqual(getTrainingEffect({anima: 2, speed: 3, vigor: 5, vitality: 7}), {
      agility: 3,
      constitution: 7,
      skill: 2,
      stamina: 7,
      strength: 5,
    });
  });
});

describe('getTrainedStatValue', () => {
  it('returns the next trained stat value from fighter stats', () => {
    equal(getTrainedStatValue({stamina: 3, vitality: 7}, 'stamina', 2), 17);
  });

  it('returns null for unknown training stats', () => {
    equal(getTrainedStatValue({vitality: 7}, 'charisma'), null);
  });
});
