import {create} from 'zustand';
import {parseBigIntStats} from 'shared/stats.js';
import {mergeFightState} from './fightStateMerge.js';

const useFightStore = create((set) => createFightState(set));

export default useFightStore;

export function resetFightStore() {
  useFightStore.setState(createFightState(useFightStore.setState), true);
}

function createFightState(set, fight = null) {
  return {
    ...getServerFightState(fight),
    pendingFeed: [],
    ...createFightActions(set),
  };
}

function createFightActions(set) {
  return {
    addPendingFeedItem: (moveName) => set((state) => addPendingFeedItem(state, moveName)),
    markMoveUsed: (moveID, lastUsed = Date.now()) => set((state) => markMoveUsed(state, moveID, lastUsed)),
    syncServerState: (nextFight) => set(
      (state) => ({...mergeFightState(state, getServerFightState(nextFight)), ...createFightActions(set), pendingFeed: []}),
      true,
    ),
  };
}

function getInitialFightState() {
  return {
    attacker: null,
    created_at: null,
    defender: null,
    details: null,
    id: null,
    rank: null,
    reason: null,
    updated_at: null,
    victory: null,
  };
}

function getServerFightState(fight) {
  if(!fight || typeof fight !== 'object') {
    return getInitialFightState();
  }
  return {
    ...getInitialFightState(),
    ...fight,
    details: parseFightDetails(fight.details),
  };
}

function parseFightDetails(details) {
  return {
    ...details,
    attacker: parseFightParticipant(details.attacker),
    ...(details.defender ? {defender: parseFightParticipant(details.defender)} : {}),
  };
}

function parseFightParticipant(participant) {
  return {
    ...participant,
    startingStats: parseBigIntStats(participant.startingStats),
    stats: parseBigIntStats(participant.stats),
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
