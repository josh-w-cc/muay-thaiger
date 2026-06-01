import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import createCallTracker from '../utils/test/createCallTracker.js';
import {createFight} from './fights.js';

describe('createFight', () => {
  it('creates a gold fight with captured attacker and defender starting stats', async () => {
    const create = createCallTracker();
    const fighter = {
      anima: 11,
      constitution: 12,
      durability: 13,
      id: 9,
      reach: 14,
      skill: 15,
      speed: 16,
      stamina: 17,
      vigor: 18,
      vitality: 19,
    };
    const fighters = {findCurrentByPlayerID: async () => fighter};
    const fights = {create};

    await createFight({fighters, fights}, 1, 'gold');

    assert.equal(create.calls.length, 1);
    assert.deepEqual(create.calls[0][0], {
      attacker: 9,
      defender: null,
      details: {
        attacker: {
          starting_stats: {
            anima: '11',
            constitution: '12',
            durability: '13',
            reach: '14',
            skill: '15',
            speed: '16',
            stamina: '17',
            vigor: '18',
            vitality: '19',
          },
        },
        defender: {
          starting_stats: {
            anima: '11',
            constitution: '12',
            durability: '13',
            reach: '14',
            skill: '15',
            speed: '16',
            stamina: '17',
            vigor: '18',
            vitality: '19',
          },
        },
      },
      reason: 'gold',
    });
  });

  it('creates a rank fight without defender starting stats', async () => {
    const create = createCallTracker();
    const fighter = {id: 9};
    const fighters = {findCurrentByPlayerID: async () => fighter};
    const fights = {create};

    await createFight({fighters, fights}, 1, 'rank');

    assert.equal(create.calls.length, 1);
    assert.equal(create.calls[0][0].details.defender, undefined);
  });

  it('uses nested fighter.stats values when top-level stats are missing', async () => {
    const create = createCallTracker();
    const fighter = {
      id: 9,
      stats: {
        anima: 1n,
        constitution: 2n,
        durability: 3n,
        reach: 4n,
        skill: 5n,
        speed: 6n,
        stamina: 7n,
        vigor: 8n,
        vitality: 9n,
      },
    };
    const fighters = {findCurrentByPlayerID: async () => fighter};
    const fights = {create};

    await createFight({fighters, fights}, 1, 'gold');

    assert.deepEqual(create.calls[0][0].details.attacker.starting_stats, {
      anima: '1',
      constitution: '2',
      durability: '3',
      reach: '4',
      skill: '5',
      speed: '6',
      stamina: '7',
      vigor: '8',
      vitality: '9',
    });
  });

  it('throws invalid-fight-message when reason is invalid', async () => {
    const create = createCallTracker();
    const fighters = {findCurrentByPlayerID: async () => ({id: 9})};
    const fights = {create};

    await assert.rejects(
      createFight({fighters, fights}, 1, 'tournament'),
      {message: 'invalid-fight-message'},
    );

    assert.equal(create.calls.length, 0);
  });

  it('throws invalid-fight-message when player has no current fighter', async () => {
    const create = createCallTracker();
    const fighters = {findCurrentByPlayerID: async () => null};
    const fights = {create};

    await assert.rejects(
      createFight({fighters, fights}, 1, 'gold'),
      {message: 'invalid-fight-message'},
    );

    assert.equal(create.calls.length, 0);
  });
});
