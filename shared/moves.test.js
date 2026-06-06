import {deepEqual, equal} from 'node:assert/strict';
import {describe, it} from 'node:test';

import {MOVE_DEFINITIONS, MOVE_DEFINITIONS_BY_ID, MOVE_IDS, MOVE_SEED_MOVES} from './moves.js';


describe('MOVE_IDS', () => {
  it('defines the expected ids for initial moves', () => {
    deepEqual(MOVE_IDS, {
      wildKick: 2,
      wildPunch: 1,
    });
  });
});

describe('MOVE_SEED_MOVES', () => {
  it('creates move seed data from the shared move definitions', () => {
    deepEqual(MOVE_SEED_MOVES, [
      {id: MOVE_IDS.wildPunch, name: 'Wild Punch'},
      {id: MOVE_IDS.wildKick, name: 'Wild Kick'},
    ]);
  });
});

describe('MOVE_DEFINITIONS', () => {
  it('applies each move affect to the opponent', () => {
    const calls = [];
    const fighter = {};
    const opponent = {
      takeDamage: (amount) => calls.push(amount),
    };

    for(const move of Object.values(MOVE_DEFINITIONS)) {
      move.affect(fighter, opponent);
    }

    deepEqual(calls, [2, 3]);
  });

  it('defines expected metadata for initial moves', () => {
    equal(MOVE_DEFINITIONS.wildPunch.name, 'Wild Punch');
    equal(MOVE_DEFINITIONS.wildPunch.recovery, 3);
    equal(MOVE_DEFINITIONS.wildPunch.staminaCost, 10);
    equal(MOVE_DEFINITIONS.wildPunch.duration, undefined);
    equal(MOVE_DEFINITIONS.wildKick.name, 'Wild Kick');
    equal(MOVE_DEFINITIONS.wildKick.recovery, 5);
    equal(MOVE_DEFINITIONS.wildKick.staminaCost, 20);
    equal(MOVE_DEFINITIONS.wildKick.duration, undefined);
  });
});

describe('MOVE_DEFINITIONS_BY_ID', () => {
  it('maps move IDs to their move definitions', () => {
    equal(MOVE_DEFINITIONS_BY_ID[MOVE_IDS.wildPunch], MOVE_DEFINITIONS.wildPunch);
    equal(MOVE_DEFINITIONS_BY_ID[MOVE_IDS.wildKick], MOVE_DEFINITIONS.wildKick);
  });
});
