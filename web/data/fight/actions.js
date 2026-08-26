import {MOVE_CLICK_BATCH_MILLISECONDS} from '@/actions/websockets/clientCommands.js';
import {getMarkedMoveState} from './fightMoveUsage.js';
import {mergeFightState} from './fightStateMerge.js';

import {getServerFightState} from './serverState.js';

export function createFightActions(set) {
  return {
    addPendingFeedItem: (moveName) => set((state) => addPendingFeedItem(state, moveName)),
    markMoveUsed: (moveID, lastUsed = Date.now()) => {
      const moveLastUsed = lastUsed + MOVE_CLICK_BATCH_MILLISECONDS;
      let canUseMove = true;
      set((state) => {
        const nextMarkedMoveState = markMoveUsed(state, moveID, moveLastUsed);
        canUseMove = nextMarkedMoveState !== null;
        return nextMarkedMoveState ?? state;
      });
      return canUseMove;
    },
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
  const markedMoveState = getMarkedMoveState(state.details?.attacker, moveID, lastUsed);
  if(!markedMoveState.canUseMove) {
    return null;
  }
  if(!markedMoveState.attacker) {
    return state;
  }
  return {
    details: {
      ...state.details,
      attacker: markedMoveState.attacker,
    },
  };
}
