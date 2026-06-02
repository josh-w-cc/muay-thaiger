import {FIGHTER_STAT_KEYS} from 'shared/stats.js';
import {isFightReason, normalizeFightReason} from 'shared/fights.js';
import {createCommandError} from './command-errors.js';

const BOT_RANK_STATS = {
  '': 100n,
};

export async function createFight({fighters, fights}, playerID, reason, rank = '') {
  const normalizedReason = normalizeFightReason(reason);
  const normalizedRank = normalizeFightRank(rank);
  validateFightMessage(playerID, normalizedReason);
  const fighter = await getCurrentFighter(fighters, playerID);
  return fights.create({
    attacker: fighter.id,
    defender: null,
    details: createFightDetails(fighter, normalizedReason, normalizedRank),
    rank: normalizedRank,
    reason: normalizedReason,
  });
}

function createFightDetails(fighter, reason, rank) {
  const attackerStats = captureStartingStats(fighter);
  return {
    attacker: {starting_stats: attackerStats},
    ...(reason === 'gold' ? {defender: {starting_stats: createBotStartingStats(rank)}} : {}),
  };
}

function captureStartingStats(fighter) {
  return Object.fromEntries(
    FIGHTER_STAT_KEYS.map((stat) => [stat, (fighter[stat] ?? fighter.stats?.[stat] ?? 0).toString()]),
  );
}

function createBotStartingStats(rank) {
  const baseStat = BOT_RANK_STATS[rank] ?? BOT_RANK_STATS[''];
  return Object.fromEntries(
    FIGHTER_STAT_KEYS.map((stat) => [stat, baseStat.toString()]),
  );
}

function normalizeFightRank(rank) {
  return typeof rank === 'string' ? rank.trim() : '';
}

function validateFightMessage(playerID, reason) {
  if(!playerID || !isFightReason(reason)) {
    throw createCommandError('invalid-fight-message');
  }
}

async function getCurrentFighter(fighters, playerID) {
  const fighter = await fighters.findCurrentByPlayerID(playerID);
  if(!fighter) {
    throw createCommandError('invalid-fight-message');
  }
  return fighter;
}
