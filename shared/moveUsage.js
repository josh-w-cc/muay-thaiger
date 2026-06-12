export function isMoveInRecoveryWindow(lastUsed, recoverySeconds, now = Date.now()) {
  if(!canCheckRecoveryWindow(lastUsed, recoverySeconds, now)) {
    return false;
  }
  return lastUsed > (now - (recoverySeconds * 1000));
}

export function getStaminaCostFromPercentage(maxStamina, staminaCostPercent) {
  return (maxStamina * BigInt(staminaCostPercent)) / 100n;
}

export function getRemainingStaminaAfterCost(currentStamina, maxStamina, staminaCostPercent) {
  return currentStamina - getStaminaCostFromPercentage(maxStamina, staminaCostPercent);
}

function canCheckRecoveryWindow(lastUsed, recoverySeconds, now) {
  return (
    lastUsed != null
    && Number.isFinite(lastUsed)
    && Number.isFinite(recoverySeconds)
    && Number.isFinite(now)
  );
}
