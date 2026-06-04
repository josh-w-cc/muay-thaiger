export const FIGHT_REASONS = Object.freeze(['gold', 'rank']);

export function isFightReason(reason) {
  return FIGHT_REASONS.includes(normalizeFightReason(reason));
}

export function normalizeFightReason(reason) {
  return typeof reason === 'string' ? reason.trim() : '';
}
