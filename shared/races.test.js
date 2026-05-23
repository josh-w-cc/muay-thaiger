import {deepEqual} from 'node:assert/strict';
import {describe, it} from 'node:test';

import {RACES} from './races.js';


describe('RACES', () => {
  it('defines the shared race base stats for api and web', () => {
    deepEqual(RACES, [
      {
        id: 1,
        name: 'Tiger',
        stats: {anima: 1, durability: 1, innateStrength: 2, reach: 2, speed: 1, vitality: 2},
      },
      {
        id: 2,
        name: 'Snow Leopard',
        stats: {anima: 2, durability: 2, innateStrength: 1, reach: 1, speed: 2, vitality: 1},
      },
    ]);
  });
});
