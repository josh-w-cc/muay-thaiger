import {MOVE_DEFINITIONS_BY_ID} from 'shared/moves.js';

export function getMarkedMoveState(attacker, moveID, lastUsed) {
  if(!canMarkMove(attacker, moveID, lastUsed)) {
    return {attacker: null, canUseMove: true};
  }
  const move = attacker.moves.find(({id}) => id === moveID);
  if(!move) {
    return {attacker: null, canUseMove: true};
  }
  const nextStats = getNextStats(attacker, move, moveID, lastUsed);
  if(nextStats === null) {
    return {attacker: null, canUseMove: false};
  }
  return {attacker: {...attacker, moves: getUpdatedMoves(attacker.moves, moveID, lastUsed), stats: nextStats}, canUseMove: true};
}

function canMarkMove(attacker, moveID, lastUsed) {
  return Boolean(
    Number.isInteger(moveID)
    && Number.isFinite(lastUsed)
    && Array.isArray(attacker?.moves),
  );
}

function getUpdatedMoves(moves, moveID, lastUsed) {
  return moves.map((move) => (move.id === moveID ? {...move, lastUsed} : move));
}

function getNextStats(attacker, move, moveID, now) {
  if(!shouldConsumeStamina(move, moveID, now)) {
    return attacker.stats;
  }

  if(!hasBigIntStamina(attacker)) {
    return attacker.stats;
  }

  const cost = getStaminaCost(attacker.startingStats.stamina, moveID);
  const nextStamina = attacker.stats.stamina - cost;
  if(nextStamina < 0n) {
    return null;
  }
  return {...attacker.stats, stamina: nextStamina};
}

function shouldConsumeStamina(move, moveID, now) {
  const moveDefinition = MOVE_DEFINITIONS_BY_ID[moveID];
  if(!moveDefinition || move.lastUsed == null) {
    return false;
  }

  const recoveryThreshold = now - (moveDefinition.recovery * 1000);
  return move.lastUsed > recoveryThreshold;
}

function hasBigIntStamina(attacker) {
  return (
    typeof attacker.startingStats?.stamina === 'bigint'
    && typeof attacker.stats?.stamina === 'bigint'
  );
}

function getStaminaCost(maxStamina, moveID) {
  const staminaCost = BigInt(MOVE_DEFINITIONS_BY_ID[moveID].staminaCost);
  return (maxStamina * staminaCost) / 100n;
}
