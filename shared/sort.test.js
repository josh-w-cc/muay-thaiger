import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {sortByProperty} from './sort.js';


describe('sortByProperty', () => {
  it('sorts objects by string property', () => {
    const items = [
      {id: 2, name: 'Tiger'},
      {id: 3, name: 'Aardvark'},
      {id: 1, name: 'Leopard'},
    ];

    const result = sortByProperty(items, 'name');

    assert.deepEqual(result.map(({name}) => name), ['Aardvark', 'Leopard', 'Tiger']);
  });

  it('sorts objects by number property', () => {
    const items = [
      {id: 2, level: 20},
      {id: 3, level: 5},
      {id: 1, level: 10},
    ];

    const result = sortByProperty(items, 'level');

    assert.deepEqual(result.map(({level}) => level), [5, 10, 20]);
  });

  it('does not mutate the original array', () => {
    const items = [
      {id: 3, rank: 3},
      {id: 1, rank: 1},
      {id: 2, rank: 2},
    ];

    sortByProperty(items, 'rank');

    assert.deepEqual(items.map(({id}) => id), [3, 1, 2]);
  });

  it('places nullish property values at the end', () => {
    const items = [
      {id: 2, displayName: null},
      {id: 3, displayName: 'Alpha'},
      {id: 1},
      {id: 4, displayName: 'Bravo'},
    ];

    const result = sortByProperty(items, 'displayName');

    assert.deepEqual(result.map(({id}) => id), [3, 4, 2, 1]);
  });
});
