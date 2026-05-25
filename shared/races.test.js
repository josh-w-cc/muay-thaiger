import {deepEqual} from 'node:assert/strict';
import {describe, it} from 'node:test';

import {RACES} from './races.js';


describe('RACES', () => {
  it('defines the shared race base stats for api and web', () => {
    deepEqual(RACES, [
      {
        id: 1,
        name: 'Tiger',
        stats: {anima: 1n, durability: 1n, reach: 2n, speed: 1n, vigor: 2n, vitality: 2n},
      },
      {
        id: 2,
        name: 'Snow Leopard',
        stats: {anima: 2n, durability: 2n, reach: 1n, speed: 2n, vigor: 1n, vitality: 1n},
      },
    ]);
  });
});
