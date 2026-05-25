import {deepEqual, equal} from 'node:assert/strict';
import {describe, it} from 'node:test';

import trainStat from './trainingStat.js';

describe('trainStat', () => {
  it('applies training to the target stat and returns the new value', () => {
    const stats = {stamina: 3, vitality: 2};

    const trainedStatValue = trainStat(stats, 'stamina', 2);

    equal(trainedStatValue, 7);
    deepEqual(stats, {stamina: 7, vitality: 2});
  });

  it('returns null and keeps stats unchanged for unknown training stats', () => {
    const stats = {stamina: 3, vitality: 2};

    const trainedStatValue = trainStat(stats, 'charisma', 2);

    equal(trainedStatValue, null);
    deepEqual(stats, {stamina: 3, vitality: 2});
  });
});
