import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import createCallTracker from '../utils/test/createCallTracker.js';
import {applyOfflineTraining, getPlayerState, sendPlayerState} from './player-state.js';

describe('applyOfflineTraining', () => {
  it('applies training for stale non-retired fighters only once per fighter', async () => {
    const staleRows = [{fighter: 1}, {fighter: 1}, {fighter: 2}, {fighter: 3}];
    const updatedFighterIDs = [];
    const fighterActions = {
      listByFighterID: async () => [{action: 1, fighter: 1, id: 10, touched_at: new Date().toISOString()}],
      listStaleBefore: async () => staleRows,
      touch: async () => null,
    };
    const fighters = {
      find: async (fighterID) => {
        if(fighterID === 1) {
          return {id: 1, player: 11, retired: false, stats: {}};
        }
        if(fighterID === 2) {
          return {id: 2, player: 22, retired: true, stats: {}};
        }
        return null;
      },
      update: async (fighterID, data) => {
        updatedFighterIDs.push(fighterID);
        return {id: fighterID, player: 11, retired: false, ...data};
      },
    };

    await applyOfflineTraining(null, {fighterActions, fighters});

    assert.deepEqual(updatedFighterIDs, [1]);
  });
});

describe('getPlayerState', () => {
  it('returns actions and updated fighter after applying training', async () => {
    const fighter = {gold: '0', id: 9, player: 5, retired: false, stats: {}};
    const updatedFighter = {...fighter, gold: '1'};
    const actions = [{action: 1, fighter: 9, id: 7, touched_at: new Date().toISOString()}];
    const fighterActions = {
      listByFighterID: async () => actions,
      touch: async () => null,
    };
    const fights = {findActiveByFighterID: async () => null};
    const fighters = {
      findCurrentByPlayerID: async () => fighter,
      update: async () => updatedFighter,
    };

    const result = await getPlayerState({fighterActions, fights, fighters}, 5);

    assert.equal(result.fighter, updatedFighter);
    assert.deepEqual(result.actions, actions);
  });

  it('returns actions and original fighter when no actions are present', async () => {
    const fighter = {id: 9, player: 5, retired: false, stats: {}};
    const fighterActions = {listByFighterID: async () => []};
    const fights = {findActiveByFighterID: async () => null};
    const fighters = {findCurrentByPlayerID: async () => fighter};

    const result = await getPlayerState({fighterActions, fights, fighters}, 5);

    assert.deepEqual(result, {actions: [], fighter});
  });

  it('returns an active unresolved fight when the fighter has one', async () => {
    const fighter = {id: 9, player: 5, retired: false, stats: {}};
    const fight = {attacker: 9, defender: null, details: {}, id: 3, reason: 'gold', victory: null};
    const fighterActions = {listByFighterID: async () => []};
    const fighters = {findCurrentByPlayerID: async () => fighter};
    const fights = {findActiveByFighterID: async () => fight};

    const result = await getPlayerState({fighterActions, fights, fighters}, 5);

    assert.deepEqual(result, {actions: [], fight, fighter});
  });

  it('prefers the loaded fight store keyed by player id', async () => {
    const fighter = {id: 9, player: 5, retired: false, stats: {}};
    const fight = {attacker: 9, defender: null, details: {}, id: 4, reason: 'gold', victory: null};
    const fighterActions = {listByFighterID: async () => []};
    const fighters = {findCurrentByPlayerID: async () => fighter};
    const fights = {findActiveByFighterID: async () => ({id: 99})};

    const result = await getPlayerState({fighterActions, fighters, fights, fightStore: new Map([[5, fight]])}, 5);

    assert.deepEqual(result, {actions: [], fight, fighter});
  });

  it('returns null when the player has no current fighter', async () => {
    const fighters = {findCurrentByPlayerID: async () => null};

    const result = await getPlayerState({fighters}, 5);

    assert.equal(result, null);
  });
});

describe('sendPlayerState', () => {
  it('sends a player_state message with the given actions and fighter', () => {
    const send = createCallTracker();
    const socket = {send};
    const fighter = {gold: '0', id: 9, player: 5, retired: false, stats: {}};
    const actions = [{action: 1, fighter: 9, id: 7}];

    sendPlayerState(actions, fighter, socket);

    assert.equal(send.calls.length, 1);
    assert.deepEqual(JSON.parse(send.calls[0][0]), {actions, cmd: 'player_state', fighter});
  });

  it('sends player_state with an empty actions array', () => {
    const send = createCallTracker();
    const socket = {send};
    const fighter = {id: 3, player: 2, retired: false, stats: {}};

    sendPlayerState([], fighter, socket);

    assert.equal(send.calls.length, 1);
    assert.deepEqual(JSON.parse(send.calls[0][0]), {actions: [], cmd: 'player_state', fighter});
  });

  it('includes fight in player_state when one is provided', () => {
    const send = createCallTracker();
    const socket = {send};
    const fighter = {id: 3, player: 2, retired: false, stats: {}};
    const fight = {attacker: 3, defender: null, details: {}, id: 8, reason: 'gold', victory: null};

    sendPlayerState([], fighter, socket, fight);

    assert.equal(send.calls.length, 1);
    assert.deepEqual(JSON.parse(send.calls[0][0]), {actions: [], cmd: 'player_state', fight, fighter});
  });
});
