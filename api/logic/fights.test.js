import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import createCallTracker from '../utils/test/createCallTracker.js';
import {createFight} from './fights.js';

const HIGH_RANK_BOT_STAT = (10n ** 33n).toString();

describe('createFight', () => {
  it('creates a gold fight with captured attacker stats and low-rank bot defender stats', async () => {
    const create = createCallTracker();
    const fighter = {
      anima: 11,
      constitution: 12,
      durability: 13,
      id: 9,
      race: 2,
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
      attacker: {
        id: 9,
        race: 2,
        stats: {
          agility: '0',
          anima: '11',
          constitution: '12',
          durability: '13',
          reach: '14',
          skill: '15',
          speed: '16',
          stamina: '17',
          strength: '0',
          vigor: '18',
          vitality: '19',
        },
      },
      defender: {
        id: null,
        race: 1,
        stats: {
          agility: '100',
          anima: '100',
          constitution: '100',
          durability: '100',
          reach: '100',
          skill: '100',
          speed: '100',
          stamina: '100',
          strength: '100',
          vigor: '100',
          vitality: '100',
        },
      },
      rank: '',
      reason: 'gold',
    });
  });

  it('creates a gold fight with ranked bot defender stats', async () => {
    const create = createCallTracker();
    const fighter = {id: 9};
    const fighters = {findCurrentByPlayerID: async () => fighter};
    const fights = {create};

    await createFight({fighters, fights}, 1, 'gold', 'AAAAA');

    assert.deepEqual(create.calls[0][0], {
      attacker: {
        id: 9,
        stats: {
          agility: '0',
          anima: '0',
          constitution: '0',
          durability: '0',
          reach: '0',
          skill: '0',
          speed: '0',
          stamina: '0',
          strength: '0',
          vigor: '0',
          vitality: '0',
        },
      },
      defender: {
        id: null,
        stats: {
          agility: HIGH_RANK_BOT_STAT,
          anima: HIGH_RANK_BOT_STAT,
          constitution: HIGH_RANK_BOT_STAT,
          durability: HIGH_RANK_BOT_STAT,
          reach: HIGH_RANK_BOT_STAT,
          skill: HIGH_RANK_BOT_STAT,
          speed: HIGH_RANK_BOT_STAT,
          stamina: HIGH_RANK_BOT_STAT,
          strength: HIGH_RANK_BOT_STAT,
          vigor: HIGH_RANK_BOT_STAT,
          vitality: HIGH_RANK_BOT_STAT,
        },
      },
      rank: 'AAAAA',
      reason: 'gold',
    });
  });

  it('creates a rank fight without defender starting stats', async () => {
    const create = createCallTracker();
    const fighter = {id: 9, race: 2};
    const fighters = {findCurrentByPlayerID: async () => fighter};
    const fights = {create};

    await createFight({fighters, fights}, 1, 'rank');

    assert.equal(create.calls.length, 1);
    assert.equal(create.calls[0][0].attacker.race, 2);
    assert.equal(create.calls[0][0].defender, null);
  });

  it('uses nested fighter.stats values when top-level stats are missing', async () => {
    const create = createCallTracker();
    const fighter = {
      id: 9,
      race: 2,
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

    assert.equal(create.calls[0][0].attacker.race, 2);
    assert.deepEqual(create.calls[0][0].attacker.stats, {
      agility: '0',
      anima: '1',
      constitution: '2',
      durability: '3',
      reach: '4',
      skill: '5',
      speed: '6',
      stamina: '7',
      strength: '0',
      vigor: '8',
      vitality: '9',
    });
  });

  it('treats ZZ rank the same as an unranked gold bot', async () => {
    const create = createCallTracker();
    const fighter = {id: 9};
    const fighters = {findCurrentByPlayerID: async () => fighter};
    const fights = {create};

    await createFight({fighters, fights}, 1, 'gold', 'ZZ');

    assert.deepEqual(create.calls[0][0].defender.stats, {
      agility: '100',
      anima: '100',
      constitution: '100',
      durability: '100',
      reach: '100',
      skill: '100',
      speed: '100',
      stamina: '100',
      strength: '100',
      vigor: '100',
      vitality: '100',
    });
  });

  it('treats invalid ranks the same as an unranked gold bot', async () => {
    const create = createCallTracker();
    const fighter = {id: 9};
    const fighters = {findCurrentByPlayerID: async () => fighter};
    const fights = {create};

    await createFight({fighters, fights}, 1, 'gold', 'bronze');

    assert.deepEqual(create.calls[0][0].defender.stats, {
      agility: '100',
      anima: '100',
      constitution: '100',
      durability: '100',
      reach: '100',
      skill: '100',
      speed: '100',
      stamina: '100',
      strength: '100',
      vigor: '100',
      vitality: '100',
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
