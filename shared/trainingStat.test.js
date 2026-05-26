import {deepEqual, equal} from 'node:assert/strict';
import {describe, it} from 'node:test';

import trainStat, {getTrainedStatValue, getTrainingEffect} from './trainingStat.js';

describe('getTrainedStatValue', () => {
  it('returns the next trained stat value from fighter stats', () => {
    equal(getTrainedStatValue({stamina: 3, vitality: 7}, 'stamina', 2), 17n);
  });

  it('uses zero when the trained stat has not been initialized', () => {
    equal(getTrainedStatValue({vitality: 7}, 'stamina', 2), 14n);
  });

  it('uses zero when a training multiplier stat has not been initialized', () => {
    equal(getTrainedStatValue({stamina: 3}, 'stamina', 2), 3n);
  });

  it('returns null for unknown training stats', () => {
    equal(getTrainedStatValue({vitality: 7}, 'charisma'), null);
  });
});

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

  it('defaults missing base stats to zero', () => {
    deepEqual(getTrainingEffect({}), {
      agility: 0,
      constitution: 0,
      skill: 0,
      stamina: 0,
      strength: 0,
    });
  });
});

describe('trainStat', () => {
  it('applies training to the target stat and returns the new value', () => {
    const stats = {stamina: 3, vitality: 2};

    const trainedStatValue = trainStat(stats, 'stamina', 2);

    equal(trainedStatValue, 7n);
    deepEqual(stats, {stamina: 7n, vitality: 2});
  });

  it('returns null and keeps stats unchanged for unknown training stats', () => {
    const stats = {stamina: 3, vitality: 2};

    const trainedStatValue = trainStat(stats, 'charisma', 2);

    equal(trainedStatValue, null);
    deepEqual(stats, {stamina: 3, vitality: 2});
  });
});
