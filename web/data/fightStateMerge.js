export function mergeFightState(state, nextFightState) {
  if(!hasSameFightID(state, nextFightState)) {
    return nextFightState;
  }
  const mergedDetails = mergeFightDetails(state?.details, nextFightState?.details);
  return mergedDetails
    ? {...nextFightState, details: mergedDetails}
    : nextFightState;
}

function hasSameFightID(state, nextFightState) {
  return state?.id === nextFightState?.id;
}

function mergeFightDetails(localDetails, serverDetails) {
  const mergedAttacker = mergeAttacker(localDetails?.attacker, serverDetails?.attacker);
  if(!mergedAttacker) {
    return null;
  }
  return {...serverDetails, attacker: mergedAttacker};
}

function mergeAttacker(localAttacker, serverAttacker) {
  if(!serverAttacker) {
    return null;
  }
  const moves = mergeMoveLastUsed(localAttacker?.moves, serverAttacker.moves);
  if(moves === serverAttacker.moves) {
    return null;
  }
  return {...serverAttacker, moves};
}

function mergeMoveLastUsed(localMoves, serverMoves) {
  if(!Array.isArray(localMoves) || !Array.isArray(serverMoves) || localMoves.length === 0) {
    return serverMoves;
  }
  const localLastUsedByMoveID = new Map(localMoves.map(({id, lastUsed}) => [id, Number(lastUsed)]));
  return serverMoves.map((move) => {
    const localLastUsed = localLastUsedByMoveID.get(move.id);
    const serverLastUsed = Number(move.lastUsed);
    if(!Number.isFinite(localLastUsed) || !Number.isFinite(serverLastUsed) || localLastUsed <= serverLastUsed) {
      return move;
    }
    return {...move, lastUsed: localLastUsed};
  });
}
