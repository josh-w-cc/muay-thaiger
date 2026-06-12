import {MOVE_CLICK_BATCH_MILLISECONDS} from '@/actions/websockets/clientCommands.js';
import {mergeFightState} from '@/data/fightStateMerge.js';

import {getServerFightState} from './serverState.js';

export function createFightActions(set) {
  return {
    addPendingFeedItem: (moveName) => set((state) => addPendingFeedItem(state, moveName)),
    markMoveUsed: (moveID, lastUsed = Date.now()) => set((state) => markMoveUsed(state, moveID, lastUsed + MOVE_CLICK_BATCH_MILLISECONDS)),
    syncServerState: (nextFight) => set(
      (state) => ({...mergeFightState(state, getServerFightState(nextFight)), ...createFightActions(set), pendingFeed: []}),
      true,
    ),
  };
}

function getAttackerName(state) {
  return state.details?.attacker?.name;
}

function addPendingFeedItem(state, moveName) {
  const attackerName = getAttackerName(state);
  if(!attackerName || !moveName) {
    return state;
  }
  return {
    pendingFeed: [...state.pendingFeed, {attacker: attackerName, isSelf: true, move: moveName}],
  };
}

function markMoveUsed(state, moveID, lastUsed) {
  const moves = getMarkedMoves(state.details?.attacker?.moves, moveID, lastUsed);
  if(!moves) {
    return state;
  }
  return {
    details: {
      ...state.details,
      attacker: {
        ...state.details.attacker,
        moves,
      },
    },
  };
}

function getMarkedMoves(moves, moveID, lastUsed) {
  if(!Number.isInteger(moveID) || !Number.isFinite(lastUsed) || !Array.isArray(moves)) {
    return null;
  }
  let didUpdate = false;
  const nextMoves = moves.map((move) => {
    if(move.id !== moveID) {
      return move;
    }
    didUpdate = true;
    return {...move, lastUsed};
  });
  return didUpdate ? nextMoves : null;
}
