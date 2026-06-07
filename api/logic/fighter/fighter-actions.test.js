import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import createCallTracker from '../../utils/test/createCallTracker.js';
import {registerFighterAction, unregisterFighterAction} from './fighter-actions.js';

describe('registerFighterAction', () => {
  it('creates a fighter action for the player current fighter and returns it on a valid message', async () => {
    const created = {id: 1, action: 2, fighter: 3, created_at: '2026-01-01T00:00:00.000Z', touched_at: '2026-01-01T00:00:00.000Z'};
    const fighterActions = {
      create: async () => created,
      listByFighterID: async () => [],
    };
    const fighters = {findCurrentByPlayerID: async () => ({id: 3, player: 8, retired: false})};

    const result = await registerFighterAction({fighterActions, fighters}, {action_id: 2}, 8);

    assert.deepEqual(result, created);
  });

  it('sets touched_at to one millisecond after the latest existing touched_at', async () => {
    const create = createCallTracker();
    const fighterActions = {
      create,
      listByFighterID: async () => [
        {id: 1, touched_at: '2026-01-01T00:00:00.000Z'},
        {id: 2, touched_at: '2026-01-01T00:00:00.111Z'},
        {id: 3, touched_at: '2026-01-01T00:00:00.005Z'},
      ],
    };
    const fighters = {findCurrentByPlayerID: async () => ({id: 3, player: 8, retired: false})};

    await registerFighterAction({fighterActions, fighters}, {action_id: 2}, 8);

    assert.equal(create.calls.length, 1);
    assert.deepEqual(create.calls[0], [{
      action: 2,
      fighter: 3,
      touched_at: new Date('2026-01-01T00:00:00.112Z'),
    }]);
  });

  describe('unregisterFighterAction', () => {
    it('removes matching fighter actions for the player current fighter and returns metadata', async () => {
      const remove = createCallTracker();
      const fighterActions = {
        listByFighterID: async () => [{action: 2, id: 8}, {action: 6, id: 9}, {action: 2, id: 10}],
        remove,
        touch: createCallTracker(),
      };
      const fighters = {findCurrentByPlayerID: async () => ({id: 3, player: 8, retired: false})};

      const result = await unregisterFighterAction({fighterActions, fighters}, {action_id: 2}, 8);

      assert.deepEqual(result, {action_id: 2});
      assert.deepEqual(remove.calls, [[8], [10]]);
    });

    it('transfers touched_at to next remaining action when removing the latest', async () => {
      const touch = createCallTracker();
      const fighterActions = {
        listByFighterID: async () => [
          {action: 2, id: 8, touched_at: '3026-01-01T00:00:00.111Z'},
          {action: 6, id: 9, touched_at: '3026-01-01T00:00:00.005Z'},
          {action: 2, id: 10, touched_at: '3026-01-01T00:00:00.050Z'},
        ],
        remove: createCallTracker(),
        touch,
      };
      const fighters = {findCurrentByPlayerID: async () => ({id: 3, player: 8, retired: false})};

      await unregisterFighterAction({fighterActions, fighters}, {action_id: 2}, 8);

      assert.equal(touch.calls.length, 1);
      assert.equal(touch.calls[0][0], 9);
      assert.deepEqual(touch.calls[0][1], new Date('3026-01-01T00:00:00.111Z'));
    });

    it('does not touch remaining actions when removed action does not have the latest touched_at', async () => {
      const nowMs = Date.now();
      const touch = createCallTracker();
      const fighterActions = {
        listByFighterID: async () => [
          {action: 2, id: 8, touched_at: new Date(nowMs - 5000).toISOString()},
          {action: 6, id: 9, touched_at: new Date(nowMs - 1000).toISOString()},
        ],
        remove: createCallTracker(),
        touch,
      };
      const fighters = {findCurrentByPlayerID: async () => ({id: 3, player: 8, retired: false})};

      await unregisterFighterAction({fighterActions, fighters}, {action_id: 2}, 8);

      assert.equal(touch.calls.length, 0);
    });

    it('does not touch remaining actions when there are no remaining actions', async () => {
      const touch = createCallTracker();
      const fighterActions = {
        listByFighterID: async () => [
          {action: 2, id: 8, touched_at: '3026-01-01T00:00:00.111Z'},
        ],
        remove: createCallTracker(),
        touch,
      };
      const fighters = {findCurrentByPlayerID: async () => ({id: 3, player: 8, retired: false})};

      await unregisterFighterAction({fighterActions, fighters}, {action_id: 2}, 8);

      assert.equal(touch.calls.length, 0);
    });

    it('touches all remaining actions with now when removing the active action', async () => {
      const touch = createCallTracker();
      const fighterActions = {
        listByFighterID: async () => [
          {action: 2, id: 8, touched_at: '3026-01-01T00:00:00.000Z'},
          {action: 6, id: 9, touched_at: '3026-01-01T00:00:00.100Z'},
          {action: 4, id: 10, touched_at: '3026-01-01T00:00:00.200Z'},
        ],
        remove: createCallTracker(),
        touch,
      };
      const fighters = {findCurrentByPlayerID: async () => ({id: 3, player: 8, retired: false})};

      await unregisterFighterAction({fighterActions, fighters}, {action_id: 2}, 8);

      assert.equal(touch.calls.length, 2);
      assert.deepEqual(touch.calls.map((call) => call[0]), [9, 10]);
      assert.ok(touch.calls.every((call) => call[1] instanceof Date));
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
    const fighterActions = {create, listByFighterID: createCallTracker()};
    const fighters = {findCurrentByPlayerID: async () => null};

    await assert.rejects(
      registerFighterAction({fighterActions, fighters}, {action_id: 1}, 1),
      {message: 'invalid-idle-message'},
    );

    assert.equal(create.calls.length, 0);
  });

  it('throws invalid-idle-message when action_id does not map to a valid skill', async () => {
    const create = createCallTracker();
    const fighterActions = {create, listByFighterID: createCallTracker()};
    const fighters = {findCurrentByPlayerID: async () => ({id: 3, player: 8, retired: false, stats: {}})};

    await assert.rejects(
      registerFighterAction({fighterActions, fighters}, {action_id: 999}, 8),
      {message: 'invalid-idle-message'},
    );

    assert.equal(create.calls.length, 0);
  });

  it('throws invalid-idle-message when fighter does not meet the action requirements', async () => {
    const create = createCallTracker();
    const fighterActions = {create, listByFighterID: createCallTracker()};
    const fighters = {
      findCurrentByPlayerID: async () => ({id: 3, player: 8, retired: false, stats: {stamina: 25n}}),
    };

    await assert.rejects(
      registerFighterAction({fighterActions, fighters}, {action_id: 3}, 8),
      {message: 'invalid-idle-message'},
    );

    assert.equal(create.calls.length, 0);
  });
});
