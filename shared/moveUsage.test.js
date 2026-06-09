import {describe, it} from 'node:test';
import {equal} from 'node:assert/strict';
import {getRemainingStaminaAfterCost, getStaminaCostFromPercentage, isMoveInRecoveryWindow} from './moveUsage.js';


describe('isMoveInRecoveryWindow', () => {
  it('returns true only when last used is strictly inside recovery window', () => {
    equal(isMoveInRecoveryWindow(7_001, 3, 10_000), true);
    equal(isMoveInRecoveryWindow(7_000, 3, 10_000), false);
  });

  it('returns false when values are invalid', () => {
    equal(isMoveInRecoveryWindow(null, 3, 10_000), false);
    equal(isMoveInRecoveryWindow(8_000, Number.NaN, 10_000), false);
  });
});

describe('getStaminaCostFromPercentage', () => {
  it('calculates stamina cost as a percentage of starting stamina', () => {
    equal(getStaminaCostFromPercentage(100n, 20), 20n);
    equal(getStaminaCostFromPercentage(81n, 20), 16n);
  });
});

describe('getRemainingStaminaAfterCost', () => {
  it('subtracts percentage cost from current stamina using max stamina baseline', () => {
    equal(getRemainingStaminaAfterCost(80n, 100n, 20), 60n);
  });
});
