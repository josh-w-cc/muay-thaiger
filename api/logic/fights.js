import {FIGHTER_STAT_KEYS} from 'shared/stats.js';
import {createCommandError} from './command-errors.js';

const FIGHT_REASONS = ['gold', 'rank'];

export async function createFight({fighters, fights}, playerID, reason) {
  const normalizedReason = typeof reason === 'string' ? reason.trim() : '';
  if(!playerID || !FIGHT_REASONS.includes(normalizedReason)) {
    throw createCommandError('invalid-fight-message');
  }
  const fighter = await fighters.findCurrentByPlayerID(playerID);
  if(!fighter) {
    throw createCommandError('invalid-fight-message');
  }
  return fights.create({
    attacker: fighter.id,
    defender: null,
    details: createFightDetails(fighter, normalizedReason),
    reason: normalizedReason,
  });
}

function createFightDetails(fighter, reason) {
  const startingStats = captureStartingStats(fighter);
  return {
    attacker: {starting_stats: startingStats},
    ...(reason === 'gold' ? {defender: {starting_stats: startingStats}} : {}),
  };
}

function captureStartingStats(fighter) {
  return Object.fromEntries(
    FIGHTER_STAT_KEYS.map((stat) => [stat, (fighter[stat] ?? fighter.stats?.[stat] ?? 0).toString()]),
  );
}
