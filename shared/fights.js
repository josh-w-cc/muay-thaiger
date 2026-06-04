export const FIGHT_REASONS = Object.freeze(['gold', 'rank']);

export function isFightReason(reason) {
  return FIGHT_REASONS.includes(normalizeFightReason(reason));
}

export function normalizeFightRank(rank) {
  return typeof rank === 'string' ? rank.trim() : '';
}

export function normalizeFightReason(reason) {
  return typeof reason === 'string' ? reason.trim() : '';
}
