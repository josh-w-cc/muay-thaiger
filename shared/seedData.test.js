import {deepEqual, equal} from 'node:assert/strict';
import {describe, it} from 'node:test';

import {createSeedEntries} from './seedData.js';


describe('createSeedEntries', () => {
  it('creates id/name seed data from definitions and ids', () => {
    const result = createSeedEntries(
      {
        first: {name: 'First'},
      },
      {
        first: 11,
      },
    );

    deepEqual(result, [{id: 11, name: 'First'}]);
  });

  it('adds generated metadata to each seed entry', () => {
    const result = createSeedEntries(
      {
        first: {name: 'First'},
      },
      {
        first: 11,
      },
      () => ({type: 'train'}),
    );

    deepEqual(result, [{id: 11, name: 'First', type: 'train'}]);
  });

  it('returns a frozen array', () => {
    const result = createSeedEntries(
      {
        first: {name: 'First'},
      },
      {
        first: 11,
      },
    );

    equal(Object.isFrozen(result), true);
  });
});
