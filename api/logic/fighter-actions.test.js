import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {registerFighterAction, unregisterFighterAction} from './fighter-actions.js';

describe('registerFighterAction', () => {
  it('creates a fighter action for the player current fighter and returns it on a valid message', async () => {
    const created = {id: 1, action_id: 2, fighter_id: 3, created_at: '2026-01-01T00:00:00.000Z', touched_at: '2026-01-01T00:00:00.000Z'};
    const fighterActions = {create: async () => created, listByFighterID: async () => []};
    const fighters = {findCurrentByPlayerID: async () => ({id: 3, player_id: 8, retired: false})};

    const result = await registerFighterAction({fighterActions, fighters}, {action_id: 2}, 8);

    assert.deepEqual(result, created);
  });

  it('sets touched_at to now plus the total duration of existing actions', async () => {
    const before = Date.now();
    const create = createCallTracker();
    // action_id 2 = walking (1s), action_id 3 = shadowBoxing (2s) → total 3000ms
    const fighterActions = {
      create,
      listByFighterID: async () => [{action_id: 2}, {action_id: 3}],
    };
    const fighters = {findCurrentByPlayerID: async () => ({id: 3, player_id: 8, retired: false})};

    await registerFighterAction({fighterActions, fighters}, {action_id: 2}, 8);

    assert.equal(create.calls.length, 1);
    const touchedAt = create.calls[0][0].touched_at;
    assert.ok(touchedAt instanceof Date, 'touched_at should be a Date');
    assert.ok(touchedAt.getTime() >= before + 3000, 'touched_at should be at least now + 3000ms');
    assert.ok(touchedAt.getTime() <= Date.now() + 3000, 'touched_at should be no more than now + 3000ms');
  });

  describe('unregisterFighterAction', () => {
    it('removes matching fighter actions for the player current fighter and returns metadata', async () => {
      const remove = createCallTracker();
      const fighterActions = {
        listByFighterID: async () => [{action_id: 2, id: 8}, {action_id: 6, id: 9}, {action_id: 2, id: 10}],
        remove,
      };
      const fighters = {findCurrentByPlayerID: async () => ({id: 3, player_id: 8, retired: false})};

      const result = await unregisterFighterAction({fighterActions, fighters}, {action_id: 2}, 8);

      assert.deepEqual(result, {action_id: 2});
      assert.deepEqual(remove.calls, [[8], [10]]);
    });

    it('throws invalid-stop-message when action_id is missing', async () => {
      await assert.rejects(
        unregisterFighterAction({}, {}, 8),
        {message: 'invalid-stop-message'},
      );
    });

    it('throws invalid-stop-message when the player has no current fighter', async () => {
      const remove = createCallTracker();
      const fighterActions = {listByFighterID: createCallTracker(), remove};
      const fighters = {findCurrentByPlayerID: async () => null};

      await assert.rejects(
        unregisterFighterAction({fighterActions, fighters}, {action_id: 1}, 1),
        {message: 'invalid-stop-message'},
      );

      assert.equal(fighterActions.listByFighterID.calls.length, 0);
      assert.equal(remove.calls.length, 0);
    });
  });

  it('throws invalid-idle-message when action_id is missing', async () => {
    await assert.rejects(
      registerFighterAction({}, {}, 8),
      {message: 'invalid-idle-message'},
    );
  });

  it('throws invalid-idle-message when the player has no current fighter', async () => {
    const create = createCallTracker();
    const fighterActions = {create};
    const fighters = {findCurrentByPlayerID: async () => null};

    await assert.rejects(
      registerFighterAction({fighterActions, fighters}, {action_id: 1}, 1),
      {message: 'invalid-idle-message'},
    );

    assert.equal(create.calls.length, 0);
  });

  it('throws invalid-idle-message when action_id does not map to a valid skill', async () => {
    const create = createCallTracker();
    const fighterActions = {create};
    const fighters = {findCurrentByPlayerID: async () => ({id: 3, player_id: 8, retired: false, stats: {}})};

    await assert.rejects(
      registerFighterAction({fighterActions, fighters}, {action_id: 999}, 8),
      {message: 'invalid-idle-message'},
    );

    assert.equal(create.calls.length, 0);
  });

  it('throws invalid-idle-message when fighter does not meet the action requirements', async () => {
    const create = createCallTracker();
    const fighterActions = {create};
    const fighters = {
      findCurrentByPlayerID: async () => ({id: 3, player_id: 8, retired: false, stats: {stamina: 25}}),
    };

    await assert.rejects(
      registerFighterAction({fighterActions, fighters}, {action_id: 3}, 8),
      {message: 'invalid-idle-message'},
    );

    assert.equal(create.calls.length, 0);
  });
});

function createCallTracker() {
  const fn = (...args) => {
    fn.calls.push(args);
  };
  fn.calls = [];
  return fn;
}
