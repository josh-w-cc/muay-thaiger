import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import {MOVE_IDS} from 'shared/moves.js';

import createCallTracker from '../utils/test/createCallTracker.js';
import {syncPlayerState} from '../logic/player-state.js';
import websocketRoutes, {onConnect, onMessage} from '../routes/websocket.js';
import {mockKnex, mockKnexMulti} from '../data/utils/mock-knex.js';

const RACE_DEFAULT_STATS = {anima: 2, durability: 2, reach: 1, speed: 2, vigor: 1, vitality: 1};

describe('WebSocket /ws/connect', () => {
  it('sends an auth request when the websocket connects', async () => {
    const {knex} = mockKnex(undefined);
    const app = Fastify();
    app.decorate('db', knex);
    app.decorate('websocketConnections', new Set());
    await app.register(websocket);
    await app.register(websocketRoutes, {prefix: '/ws'});
    await app.ready();

    const socket = await app.injectWS('/ws/connect');
    const message = await readMessage(socket);

    assert.deepEqual(message, {cmd: 'auth'});
    socket.terminate();
    await app.close();
  });

  it('sends auth confirmation with player token after receiving an auth new response', async () => {
    const {knex} = mockKnex([{display_name: 'Player-12345678', id: 1, token: 'generated-token'}]);
    const app = Fastify();
    app.decorate('db', knex);
    app.decorate('websocketConnections', new Set());
    await app.register(websocket);
    await app.register(websocketRoutes, {prefix: '/ws'});
    await app.ready();

    const socket = await app.injectWS('/ws/connect');
    await readMessage(socket);
    const [authMessage, playerStateMessage] = await sendAndReadMessages(
      socket,
      {cmd: 'auth', race: 2, token: 'new'},
      2,
    );

    assert.equal(authMessage.cmd, 'auth');
    assert.equal(authMessage.player_id, 1);
    assert.equal(authMessage.token, 'generated-token');
    assert.equal(playerStateMessage.cmd, 'player_state');
    socket.terminate();
    await app.close();
  });

  it('creates a fighter action and sends it back from /ws/connect on a valid idle message', async () => {
    const created = {id: 1, action: 2, fighter: 3, created_at: '2026-01-01T00:00:00.000Z', touched_at: '2026-01-01T00:00:00.000Z'};
    const currentFighter = {id: 3, player: 8, retired: false};
    const player = {id: 8, token: 'player-token'};
    const {knex} = mockKnexMulti([
      player,
      currentFighter,
      [],
      undefined,
      currentFighter,
      [],
      currentFighter,
      [],
      [created],
      currentFighter,
      [created],
      undefined,
    ]);
    const app = Fastify();
    app.decorate('db', knex);
    app.decorate('websocketConnections', new Set());
    await app.register(websocket);
    await app.register(websocketRoutes, {prefix: '/ws'});
    await app.ready();

    const socket = await app.injectWS('/ws/connect');
    await readMessage(socket);
    await sendAndReadMessages(socket, {cmd: 'auth', token: 'player-token'}, 2);
    socket.send(JSON.stringify({action_id: 2, cmd: 'idle'}));
    const message = await readMessage(socket);

    assert.deepEqual(message, {
      cmd: 'ok',
      metadata: {fighterAction: created, responded_cmd: 'idle'},
    });
    socket.terminate();
    await app.close();
  });

  it('does not send auth request on connect when socket is not open', async () => {
    const send = createCallTracker();
    const socket = {
      OPEN: 1,
      on: createCallTracker(),
      readyState: 0,
      send,
    };
    const connections = new Set();

    onConnect(socket, {}, connections);
    await waitForImmediate();

    assert.equal(send.calls.length, 0);
  });

  it('removes websocket from active connections when it closes', async () => {
    const socketOn = createCallTracker();
    const socket = {OPEN: 1, on: socketOn, readyState: 1, send: createCallTracker()};
    const connections = new Set();

    onConnect(socket, {}, connections);
    assert.equal(connections.has(socket), true);

    const closeHandler = socketOn.calls.find(([eventName]) => eventName === 'close')[1];
    closeHandler();
    assert.equal(connections.has(socket), false);
  });

  it('ignores invalid JSON auth messages', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};

    await onMessage('{', socket, {});

    assert.equal(send.calls.length, 0);
  });

  it('responds with token invalid message for auth commands with missing token', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};

    await onMessage(JSON.stringify({cmd: 'auth'}), socket, {});

    assert.equal(send.calls.length, 1);
    assert.deepEqual(JSON.parse(send.calls[0][0]), {cmd: 'auth-invalid-token'});
  });

  it('sends error invalid-cmd for unrecognized commands', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};

    await onMessage(JSON.stringify({cmd: 'noop', token: 'new'}), socket, {});

    assert.equal(send.calls.length, 1);
    assert.deepEqual(JSON.parse(send.calls[0][0]), {cmd: 'error', error: 'invalid-cmd'});
  });

  it('responds with token invalid message for auth messages with non-string token values', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};

    await onMessage(JSON.stringify({cmd: 'auth', token: 123}), socket, {});

    assert.equal(send.calls.length, 1);
    assert.deepEqual(JSON.parse(send.calls[0][0]), {cmd: 'auth-invalid-token'});
  });

  it('does not send auth confirmation when websocket is not open', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 0, send};

    await onMessage(JSON.stringify({cmd: 'auth', race: 1, token: 'new'}), socket, {});

    assert.equal(send.calls.length, 0);
  });

  it('creates a player and sends the player token on auth new', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};
    const fighterMoves = {create: async () => null};
    const fighters = {create: async () => ({id: 1})};
    const races = {find: async () => ({id: 2, stats: RACE_DEFAULT_STATS})};
    const player = {display_name: 'Player-abcdefgh', id: 1, token: 'player-uuid-token'};
    const players = {create: async () => player};

    await onMessage(JSON.stringify({cmd: 'auth', race: 2, token: 'new'}), socket, {fighterMoves, fighters, players, races});

    assert.equal(send.calls.length, 1);
    assert.deepEqual(JSON.parse(send.calls[0][0]), {cmd: 'auth', display_name: 'Player-abcdefgh', player_id: 1, token: 'player-uuid-token'});
  });

  it('creates a fighter with the chosen race when creating a player on auth new', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};
    const fighterCreateCalls = [];
    const fighterMoveCreateCalls = [];
    const fighters = {
      create: async (input) => {
        fighterCreateCalls.push(input);
        return {id: 9, ...input};
      },
    };
    const fighterMoves = {
      create: async (input) => {
        fighterMoveCreateCalls.push(input);
        return input;
      },
    };
    const races = {find: async () => ({id: 2, stats: RACE_DEFAULT_STATS})};
    const player = {display_name: 'Player-abcdefgh', id: 1, token: 'player-uuid-token'};
    const players = {create: async () => player};

    await onMessage(JSON.stringify({cmd: 'auth', race: '2', token: 'new'}), socket, {fighterMoves, fighters, players, races});

    assert.equal(fighterCreateCalls.length, 1);
    assert.deepEqual(fighterCreateCalls[0], {
      display_name: 'Player-abcdefgh',
      player: 1,
      race: 2,
      stats: RACE_DEFAULT_STATS,
    });
    assert.deepEqual(fighterMoveCreateCalls, [
      {enabled: true, fighter: 9, move: MOVE_IDS.wildPunch},
      {enabled: true, fighter: 9, move: MOVE_IDS.wildKick},
    ]);
  });

  it('does not create a player when auth new race is invalid', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};
    const fighterMoves = {create: async () => null};
    const fighters = {create: async () => null};
    const races = {find: async () => null};
    const players = {create: async () => ({id: 1, token: 'player-uuid-token'})};

    await onMessage(JSON.stringify({cmd: 'auth', race: 'not-a-race', token: 'new'}), socket, {fighterMoves, fighters, players, races});

    assert.equal(send.calls.length, 1);
    assert.deepEqual(JSON.parse(send.calls[0][0]), {cmd: 'error', error: 'invalid-auth-data'});
  });

  it('does not create a player when auth new race is not found', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};
    const fighterMoves = {create: async () => null};
    const fighters = {create: async () => null};
    const races = {find: async () => null};
    const createPlayer = createCallTracker();
    const players = {
      create: (...args) => {
        createPlayer(...args);
        return {id: 1, token: 'player-uuid-token'};
      },
    };

    await onMessage(JSON.stringify({cmd: 'auth', race: '3', token: 'new'}), socket, {fighterMoves, fighters, players, races});

    assert.equal(createPlayer.calls.length, 0);
    assert.equal(send.calls.length, 1);
    assert.deepEqual(JSON.parse(send.calls[0][0]), {cmd: 'error', error: 'invalid-auth-data'});
  });

  it('translates an existing player token to player id on auth', async () => {
    const send = createCallTracker();
    const player = {display_name: 'Player-known', id: 5, token: 'known-token'};
    const socket = {OPEN: 1, readyState: 1, send};
    const players = {
      create: async () => null,
      findByToken: async (token) => {
        if(token !== 'known-token') {
          return null;
        }
        return player;
      },
    };

    await onMessage(JSON.stringify({cmd: 'auth', token: 'known-token'}), socket, {players});

    assert.equal(send.calls.length, 1);
    assert.deepEqual(JSON.parse(send.calls[0][0]), {cmd: 'auth', display_name: 'Player-known', player_id: 5, token: 'known-token'});
  });

  it('attaches player to socket after successful authentication', async () => {
    const send = createCallTracker();
    const player = {id: 5, token: 'known-token'};
    const socket = {OPEN: 1, readyState: 1, send};
    const players = {
      create: async () => null,
      findByToken: async (token) => (token === 'known-token' ? player : null),
    };

    await onMessage(JSON.stringify({cmd: 'auth', token: 'known-token'}), socket, {players});

    assert.equal(socket.player, player);
  });

  it('sends player_state after successful authentication when models support it', async () => {
    const send = createCallTracker();
    const player = {id: 5, token: 'known-token'};
    const fighter = {gold: '0', id: 9, player: 5, retired: false, stats: {}};
    const actions = [{action: 1, fighter: 9, id: 7}];
    const socket = {OPEN: 1, readyState: 1, send};
    const fighterActions = {
      listByFighterID: async () => actions,
    };
    const fights = {
      findActiveByFighterID: async () => null,
    };
    const fighters = {
      findCurrentByPlayerID: async () => fighter,
      update: async () => fighter,
    };
    const players = {
      create: async () => null,
      findByToken: async (token) => (token === 'known-token' ? player : null),
    };

    await onMessage(JSON.stringify({cmd: 'auth', token: 'known-token'}), socket, {fighterActions, fights, fighters, players});

    assert.equal(send.calls.length, 2);
    assert.deepEqual(JSON.parse(send.calls[0][0]), {cmd: 'auth', player_id: 5, token: 'known-token'});
    assert.deepEqual(JSON.parse(send.calls[1][0]), {actions, cmd: 'player_state', fighter});
  });

  it('includes active fight in player_state after successful authentication', async () => {
    const send = createCallTracker();
    const player = {id: 5, token: 'known-token'};
    const fighter = {gold: '0', id: 9, player: 5, retired: false, stats: {}};
    const fight = {attacker: 9, defender: null, details: {}, id: 12, reason: 'gold', victory: null};
    const socket = {OPEN: 1, readyState: 1, send};
    const fighterActions = {
      listByFighterID: async () => [],
    };
    const fighters = {
      findCurrentByPlayerID: async () => fighter,
    };
    const fights = {
      findActiveByFighterID: async () => fight,
    };
    const players = {
      create: async () => null,
      findByToken: async (token) => (token === 'known-token' ? player : null),
    };

    await onMessage(JSON.stringify({cmd: 'auth', token: 'known-token'}), socket, {fighterActions, fighters, fights, players});

    assert.equal(send.calls.length, 2);
    assert.deepEqual(JSON.parse(send.calls[1][0]), {actions: [], cmd: 'player_state', fight, fighter});
  });

  it('responds with token invalid message when auth token does not match a player', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};
    const players = {create: async () => null, findByToken: async () => null};

    await onMessage(JSON.stringify({cmd: 'auth', token: 'unknown-token'}), socket, {players});

    assert.equal(send.calls.length, 1);
    assert.deepEqual(JSON.parse(send.calls[0][0]), {cmd: 'auth-invalid-token'});
  });

  it('sends an internal error message when a command handler throws', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};
    const players = {
      create: async () => null,
      findByToken: async () => {
        throw new Error('database failure');
      },
    };

    await onMessage(JSON.stringify({cmd: 'auth', token: 'known-token'}), socket, {players});

    assert.equal(send.calls.length, 1);
    assert.deepEqual(JSON.parse(send.calls[0][0]), {cmd: 'error', error: 'internal-error'});
  });

  it('sends error for idle command when socket has no authenticated player', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};

    await onMessage(JSON.stringify({action_id: 1, cmd: 'idle'}), socket, {});

    assert.equal(send.calls.length, 1);
    assert.deepEqual(JSON.parse(send.calls[0][0]), {cmd: 'error', error: 'invalid-idle-message'});
  });

  it('sends error for fight command when socket has no authenticated player', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};

    await onMessage(JSON.stringify({cmd: 'fight'}), socket, {});

    assert.equal(send.calls.length, 1);
    assert.deepEqual(JSON.parse(send.calls[0][0]), {cmd: 'error', error: 'invalid-fight-message'});
  });

  it('creates a fight and responds to fight command for authenticated socket', async () => {
    const random = Math.random;
    Math.random = () => 0.5;
    try {
      const send = createCallTracker();
      const createFight = createCallTracker();
      const socket = {OPEN: 1, player: {id: 1}, readyState: 1, send};
      const fighter = {
        anima: 11,
        constitution: 12,
        durability: 13,
        id: 9,
        player: 1,
        reach: 14,
        retired: false,
        skill: 15,
        speed: 16,
        stamina: 17,
        vigor: 18,
        vitality: 19,
        stats: {
          constitution: 12n,
          durability: 13n,
          reach: 14n,
          skill: 15n,
          speed: 16n,
          stamina: 17n,
          strength: 18n,
        },
      };
      const createdFight = {attacker: 9, defender: null, details: {attacker: {}, defender: {}}, id: 4, reason: 'gold'};
      const fighters = {findCurrentByPlayerID: async () => fighter};
      const fights = {
        create: async (fightData) => {
          createFight(fightData);
          return createdFight;
        },
      };

      await onMessage(JSON.stringify({cmd: 'fight', reason: 'gold'}), socket, {fighters, fights});

      assert.deepEqual(createFight.calls, [[{
        attacker: 9,
        attackerStats: {
          agility: '0',
          anima: '11',
          constitution: '12',
          durability: '13',
          reach: '14',
          skill: '15',
          speed: '16',
          stamina: '17',
          strength: '18',
          vigor: '18',
          vitality: '19',
        },
        defender: null,
        defenderStats: {
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
        rank: '',
        reason: 'gold',
      }]]);
      assert.equal(send.calls.length, 1);
      assert.deepEqual(JSON.parse(send.calls[0][0]), {
        cmd: 'ok',
        metadata: {fight: createdFight, responded_cmd: 'fight'},
      });
    }
    finally {
      Math.random = random;
    }
  });

  it('sends error for fight command with invalid reason', async () => {
    const send = createCallTracker();
    const createFight = createCallTracker();
    const socket = {OPEN: 1, player: {id: 1}, readyState: 1, send};
    const fighters = {findCurrentByPlayerID: async () => ({id: 9, player: 1, retired: false})};
    const fights = {create: createFight};

    await onMessage(JSON.stringify({cmd: 'fight', reason: 'tournament'}), socket, {fighters, fights});

    assert.equal(createFight.calls.length, 0);
    assert.equal(send.calls.length, 1);
    assert.deepEqual(JSON.parse(send.calls[0][0]), {cmd: 'error', error: 'invalid-fight-message'});
  });

  it('creates a fight and responds to rank fight command for authenticated socket', async () => {
    const send = createCallTracker();
    const createFight = createCallTracker();
    const socket = {OPEN: 1, player: {id: 1}, readyState: 1, send};
    const fighter = {id: 9, player: 1, retired: false};
    const createdFight = {attacker: 9, defender: null, details: {}, id: 5, reason: 'rank'};
    const fighters = {findCurrentByPlayerID: async () => fighter};
    const fights = {
      create: async (fightData) => {
        createFight(fightData);
        return createdFight;
      },
    };

    await onMessage(JSON.stringify({cmd: 'fight', reason: 'rank'}), socket, {fighters, fights});

    assert.deepEqual(createFight.calls[0][0].reason, 'rank');
    assert.equal(send.calls.length, 1);
    assert.deepEqual(JSON.parse(send.calls[0][0]), {
      cmd: 'ok',
      metadata: {fight: createdFight, responded_cmd: 'fight'},
    });
  });

  it('does not create a fight when the authenticated player has no current fighter', async () => {
    const send = createCallTracker();
    const createFight = createCallTracker();
    const socket = {OPEN: 1, player: {id: 1}, readyState: 1, send};
    const fighters = {findCurrentByPlayerID: async () => null};
    const fights = {create: createFight};

    await onMessage(JSON.stringify({cmd: 'fight', reason: 'gold'}), socket, {fighters, fights});

    assert.equal(createFight.calls.length, 0);
    assert.equal(send.calls.length, 1);
    assert.deepEqual(JSON.parse(send.calls[0][0]), {cmd: 'error', error: 'invalid-fight-message'});
  });

  it('does not respond to idle messages when the player has no current fighter', async () => {
    const send = createCallTracker();
    const create = createCallTracker();
    const socket = {OPEN: 1, player: {id: 1}, readyState: 1, send};
    const fighterActions = {create};
    const fighters = {findCurrentByPlayerID: async () => null};

    await onMessage(JSON.stringify({action_id: 1, cmd: 'idle'}), socket, {fighterActions, fighters});

    assert.equal(send.calls.length, 1);
    assert.deepEqual(JSON.parse(send.calls[0][0]), {cmd: 'error', error: 'invalid-idle-message'});
    assert.equal(create.calls.length, 0);
  });

  it('sends player state after responding to idle commands for authenticated sockets', async () => {
    const send = createCallTracker();
    const created = {action: 1, fighter: 9, id: 4};
    const fighter = {gold: '0', id: 9, player: 1, retired: false, stats: {}};
    const socket = {OPEN: 1, player: {id: 1}, readyState: 1, send};
    const fighterActions = {
      create: async () => created,
      listByFighterID: async () => [],
    };
    const fights = {findActiveByFighterID: async () => null};
    const fighters = {findCurrentByPlayerID: async () => fighter};

    await onMessage(JSON.stringify({action_id: 1, cmd: 'idle'}), socket, {fighterActions, fights, fighters});

    assert.equal(send.calls.length, 2);
    assert.deepEqual(JSON.parse(send.calls[0][0]), {
      cmd: 'ok',
      metadata: {fighterAction: created, responded_cmd: 'idle'},
    });
    assert.deepEqual(JSON.parse(send.calls[1][0]), {
      actions: [],
      cmd: 'player_state',
      fighter,
    });
  });

  it('applies training before creating the fighter action on idle command', async () => {
    const callOrder = [];
    const existingAction = {action: 2, fighter: 9, id: 7, touched_at: new Date(Date.now() - 2000).toISOString()};
    const fighter = {gold: '0', id: 9, player: 1, retired: false, stats: {anima: 1n, speed: 1n, stamina: 1n, vigor: 1n, vitality: 1n}};
    const socket = {OPEN: 1, player: {id: 1}, readyState: 1, send: createCallTracker()};
    let listCallCount = 0;
    const fighterActions = {
      create: async () => {
        callOrder.push('create');
        return {action: 2, fighter: 9, id: 8};
      },
      listByFighterID: async () => {
        listCallCount += 1;
        return listCallCount === 1 ? [existingAction] : [];
      },
      touch: async () => {},
    };
    const fights = {findActiveByFighterID: async () => null};
    const fighters = {
      findCurrentByPlayerID: async () => fighter,
      update: async () => {
        callOrder.push('update');
        return fighter;
      },
    };

    await onMessage(JSON.stringify({action_id: 2, cmd: 'idle'}), socket, {fighterActions, fights, fighters});

    assert.ok(
      callOrder.indexOf('update') < callOrder.indexOf('create'),
      'training (update) should be applied before the action is created',
    );
  });

  it('sends error for stop command when socket has no authenticated player', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};

    await onMessage(JSON.stringify({action_id: 1, cmd: 'stop'}), socket, {});

    assert.equal(send.calls.length, 1);
    assert.deepEqual(JSON.parse(send.calls[0][0]), {cmd: 'error', error: 'invalid-stop-message'});
  });

  it('removes fighter actions and responds to stop commands for authenticated sockets', async () => {
    const send = createCallTracker();
    const remove = createCallTracker();
    let listCallCount = 0;
    const fighter = {gold: '0', id: 9, player: 1, retired: false, stats: {}};
    const socket = {OPEN: 1, player: {id: 1}, readyState: 1, send};
    const fighterActions = {
      listByFighterID: async () => {
        listCallCount += 1;
        if(listCallCount > 1) {
          return [];
        }
        return [{action: 1, id: 4}, {action: 2, id: 5}, {action: 1, id: 6}];
      },
      remove,
    };
    const fights = {findActiveByFighterID: async () => null};
    const fighters = {findCurrentByPlayerID: async () => fighter};

    await onMessage(JSON.stringify({action_id: 1, cmd: 'stop'}), socket, {fighterActions, fights, fighters});

    assert.deepEqual(remove.calls, [[4], [6]]);
    assert.equal(send.calls.length, 2);
    assert.deepEqual(JSON.parse(send.calls[0][0]), {
      cmd: 'ok',
      metadata: {fighterAction: {action_id: 1}, responded_cmd: 'stop'},
    });
    assert.deepEqual(JSON.parse(send.calls[1][0]), {
      actions: [],
      cmd: 'player_state',
      fighter,
    });
  });

  it('syncs each authenticated player current fighter state', async () => {
    const sendOpen = createCallTracker();
    const sendNoFighter = createCallTracker();
    const closedSocket = {OPEN: 1, player: {id: 3}, readyState: 0, send: createCallTracker()};
    const fighterRecord = {gold: '0', id: 9, player: 1, retired: false, stats: {}};
    const updatedFighterRecord = {...fighterRecord, gold: '1'};
    const actions = [{action: 1, fighter: 9, id: 5}];
    const fighterActions = {
      listByFighterID: async () => actions,
      touch: async () => null,
    };
    const fight = {attacker: 9, defender: null, details: {}, id: 12, reason: 'gold', victory: null};
    const fighters = {
      findCurrentByPlayerID: async (id) => {
        if(id === 1) {
          return fighterRecord;
        }
        return null;
      },
      update: async () => updatedFighterRecord,
    };
    const fights = {
      findActiveByFighterID: async (fighterID) => (fighterID === 9 ? fight : null),
    };
    const sockets = new Set([
      {OPEN: 1, player: {id: 1}, readyState: 1, send: sendOpen},
      {OPEN: 1, player: {id: 2}, readyState: 1, send: sendNoFighter},
      {OPEN: 1, readyState: 1, send: createCallTracker()},
      closedSocket,
    ]);

    await syncPlayerState({fighterActions, fights, fighters}, sockets);

    assert.equal(sendOpen.calls.length, 1);
    assert.deepEqual(JSON.parse(sendOpen.calls[0][0]), {
      actions,
      cmd: 'player_state',
      fight,
      fighter: updatedFighterRecord,
    });
    assert.equal(sendNoFighter.calls.length, 0);
    assert.equal(sockets.has(closedSocket), false);
  });
});

async function readMessage(socket) {
  return new Promise((resolve, reject) => {
    socket.once('error', reject);
    socket.once('message', (data) => resolve(JSON.parse(data)));
  });
}

async function readMessages(socket, count) {
  return new Promise((resolve, reject) => {
    const messages = [];
    const onError = (error) => {
      cleanup();
      reject(error);
    };
    const onMessage = (data) => {
      messages.push(JSON.parse(data));
      if(messages.length < count) {
        return;
      }
      cleanup();
      resolve(messages);
    };
    const cleanup = () => {
      socket.off('error', onError);
      socket.off('message', onMessage);
    };
    socket.on('error', onError);
    socket.on('message', onMessage);
  });
}

function sendAndReadMessages(socket, message, count) {
  const messagesPromise = readMessages(socket, count);
  socket.send(JSON.stringify(message));
  return messagesPromise;
}

async function waitForImmediate() {
  await new Promise((resolve) => setImmediate(resolve));
}
