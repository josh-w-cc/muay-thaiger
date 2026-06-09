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
    },
  };
}
