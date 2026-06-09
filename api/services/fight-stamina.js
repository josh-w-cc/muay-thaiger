const STAMINA_REGEN_MS_PER_POINT = 100n * 1000n;

export function recoverFightStamina(fight) {
  const now = Date.now();
  recoverParticipantStamina(fight.details.attacker, now);
  if(fight.details.defender) {
    recoverParticipantStamina(fight.details.defender, now);
  }
}

function recoverParticipantStamina(participant, now) {
  const recoveryState = getRecoveryState(participant, now);
  if(!recoveryState) {
    return;
  }
  const {maxStamina, regenPool} = recoveryState;
  const recoveredStamina = regenPool / STAMINA_REGEN_MS_PER_POINT;
  const missingStamina = maxStamina - participant.stats.stamina;
  const appliedStamina = clampRecoveredStamina(recoveredStamina, missingStamina);

  participant.stats.stamina += appliedStamina;
  participant.staminaRecoveryRemainder = getRecoveryRemainder(participant.stats.stamina, maxStamina, regenPool);
  participant.staminaRecoveredAt = now;
}

function getRecoveryState(participant, now) {
  const maxStamina = getMaxStamina(participant);
  if(maxStamina == null) {
    return null;
  }
  const lastRecoveredAt = getLastRecoveredAt(participant, now);
  const elapsedMilliseconds = now - lastRecoveredAt;
  if(elapsedMilliseconds <= 0) {
    return null;
  }
  const regenPool = (participant.staminaRecoveryRemainder ?? 0n) + (maxStamina * BigInt(elapsedMilliseconds));
  return {maxStamina, regenPool};
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
  return stamina >= maxStamina ? 0n : (regenPool % STAMINA_REGEN_MS_PER_POINT);
}
