import {calculateFighterHealth} from './fight-judge-utils.js';

export function captureStartingStats(fight) {
  const {attacker, defender, ...rest} = fight.details;
  const now = Date.now();
  return {
    ...fight,
    details: {
      attacker: addStartingStats(attacker, now),
      ...(defender ? {defender: addStartingStats(defender, now)} : {}),
      ...rest,
      feed: [],
    },
  };
}

export function recoverFightStamina(fight) {
  const now = Date.now();
  recoverParticipantStamina(fight.details.attacker, now);
  if(fight.details.defender) {
    recoverParticipantStamina(fight.details.defender, now);
  }
}

function addStartingStats(participant, now) {
  const health = calculateFighterHealth(participant.stats);
  participant.stats.health = health;
  return {
    ...participant,
    moveList: [],
    staminaRecoveredAt: now,
    staminaRecoveryRemainder: 0n,
    startingStats: {
      ...participant.stats,
      health,
    },
  };
}

function recoverParticipantStamina(participant, now) {
  const recoveryState = getRecoveryState(participant, now);
  if(!recoveryState) {
    return;
  }
  const {elapsedSeconds, maxStamina, regenPool, lastRecoveredAt} = recoveryState;
  const recoveredStamina = regenPool / 100n;
  const missingStamina = maxStamina - participant.stats.stamina;
  const appliedStamina = clampRecoveredStamina(recoveredStamina, missingStamina);

  participant.stats.stamina += appliedStamina;
  participant.staminaRecoveryRemainder = getRecoveryRemainder(participant.stats.stamina, maxStamina, regenPool);
  participant.staminaRecoveredAt = lastRecoveredAt + (elapsedSeconds * 1000);
}

function getRecoveryState(participant, now) {
  const maxStamina = getMaxStamina(participant);
  if(maxStamina == null) {
    return null;
  }
  const lastRecoveredAt = getLastRecoveredAt(participant, now);
  const elapsedSeconds = Math.floor((now - lastRecoveredAt) / 1000);
  if(elapsedSeconds <= 0) {
    return null;
  }
  const regenPool = (participant.staminaRecoveryRemainder ?? 0n) + (maxStamina * BigInt(elapsedSeconds));
  return {elapsedSeconds, lastRecoveredAt, maxStamina, regenPool};
}

function getMaxStamina(participant) {
  return participant.startingStats ? participant.startingStats.stamina : null;
}

function getLastRecoveredAt(participant, now) {
  return participant.staminaRecoveredAt == null ? now : participant.staminaRecoveredAt;
}

function clampRecoveredStamina(recoveredStamina, missingStamina) {
  if(missingStamina <= 0n) {
    return 0n;
  }
  if(recoveredStamina >= missingStamina) {
    return missingStamina;
  }
  return recoveredStamina;
}

function getRecoveryRemainder(stamina, maxStamina, regenPool) {
  return stamina >= maxStamina ? 0n : (regenPool % 100n);
}
