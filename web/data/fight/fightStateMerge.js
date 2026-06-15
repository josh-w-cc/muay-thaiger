export function mergeFightState(state, nextFightState) {
  if(getFightID(state) !== getFightID(nextFightState)) {
    return nextFightState;
  }
  const nextMoves = getAttackerMoves(nextFightState);
  const moves = mergeMoveLastUsed(getAttackerMoves(state), nextMoves);
  if(moves === nextMoves) {
    return nextFightState;
  }
  return {
    ...nextFightState,
    details: {
      ...nextFightState.details,
      attacker: {
        ...nextFightState.details.attacker,
        moves,
      },
    },
  };
}

function getFightID(fightState) {
  return fightState ? fightState.id : null;
}

function getAttackerMoves(fightState) {
  return fightState?.details?.attacker?.moves;
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
