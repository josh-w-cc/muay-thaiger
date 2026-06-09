import {create} from 'zustand';
import {parseBigIntStats} from 'shared/stats.js';
import {RACES} from 'shared/races.js';

const useFightStore = create((set) => createFightState(set));

export default useFightStore;

export function resetFightStore() {
  useFightStore.setState(createFightState(useFightStore.setState), true);
}

function createFightState(set, fight = null) {
  return {
    ...getServerFightState(fight),
    addPendingFeedItem: (moveName) => set((state) => addPendingFeedItem(state, moveName)),
    markMoveUsed: (moveID, lastUsed = Date.now()) => set((state) => markMoveUsed(state, moveID, lastUsed)),
    pendingFeed: [],
    syncServerState: (nextFight) => set(createFightState(set, nextFight), true),
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

function addPendingFeedItem(state, moveName) {
  const race = state.details?.attacker?.race;
  const attackerName = RACES.find((r) => r.id === race)?.name;
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
