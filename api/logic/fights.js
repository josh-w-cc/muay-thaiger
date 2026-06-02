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
    attacker: {
      id: fighter.id,
      race: fighter.race,
      stats: captureFightStats(fighter),
    },
    defender: normalizedReason === 'gold' ? {id: null, race: 1, stats: createBotStats(normalizedRank)} : null,
    rank: normalizedRank,
    reason: normalizedReason,
  });
}

function captureFightStats(fighter) {
  return Object.fromEntries(
    FIGHTER_STAT_KEYS.map((stat) => [stat, (fighter[stat] ?? fighter.stats?.[stat] ?? 0).toString()]),
  );
}

function createBotStats(rank) {
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
