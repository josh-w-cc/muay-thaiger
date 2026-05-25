import {deepEqual} from 'node:assert/strict';
import {describe, it} from 'node:test';

import {getTrainingEffect} from './training.js';


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
