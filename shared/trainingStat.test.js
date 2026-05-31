import {deepEqual, equal} from 'node:assert/strict';
import {describe, it} from 'node:test';

import trainStat, {getTrainingEffect} from './trainingStat.js';

describe('getTrainingEffect', () => {
  it('maps base stats to training multipliers', () => {
    deepEqual(getTrainingEffect({anima: 2n, speed: 3n, vigor: 5n, vitality: 7n}), {
      agility: 3n,
      constitution: 7n,
      skill: 2n,
      stamina: 7n,
      strength: 5n,
    });
  });

  it('defaults missing base stats to zero', () => {
    deepEqual(getTrainingEffect({}), {
      agility: 0n,
      constitution: 0n,
      skill: 0n,
      stamina: 0n,
      strength: 0n,
    });
  });
});

describe('trainStat', () => {
  it('applies training to the target stat and returns the new value', () => {
    const stats = {stamina: 3n, vitality: 2n};

    const trainedStatValue = trainStat(stats, 'stamina', 2n);

    equal(trainedStatValue, 7n);
    deepEqual(stats, {stamina: 7n, vitality: 2n});
  });

  it('treats unknown stats as +1 per amount', () => {
    const stats = {focus: 2n};

    const trainedStatValue = trainStat(stats, 'focus', 3n);

    equal(trainedStatValue, 5n);
    deepEqual(stats, {focus: 5n});
  });
});
