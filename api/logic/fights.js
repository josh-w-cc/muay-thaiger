import {FIGHTER_STAT_KEYS} from 'shared/stats.js';
import {isFightReason, normalizeFightReason} from 'shared/fights.js';
import {createCommandError} from './command-errors.js';

const BOT_RANK_STATS = {
  '': 100n,
};
const BOT_RANK_STEP = 10n;
const BOT_RANK_PATTERN = /^[A-Z]{2,5}$/;
const RANK_Z_CHAR_CODE = 'Z'.charCodeAt(0);

export async function createFight({fighters, fights}, playerID, reason, rank = '') {
  const normalizedReason = normalizeFightReason(reason);
  const normalizedRank = normalizeFightRank(rank);
  validateFightMessage(playerID, normalizedReason);
  const fighter = await getCurrentFighter(fighters, playerID);
  return fights.create({
    attacker: {
      id: fighter.id,
      stats: captureFightStats(fighter),
    },
    defender: normalizedReason === 'gold' ? {id: null, stats: createBotStats(normalizedRank)} : null,
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
  const baseStat = BOT_RANK_STATS[''] + getBotRankBonus(rank);
  return Object.fromEntries(
    FIGHTER_STAT_KEYS.map((stat) => [stat, baseStat.toString()]),
  );
}

function normalizeFightRank(rank) {
  return typeof rank === 'string' ? rank.trim() : '';
}

function getBotRankBonus(rank) {
  const normalizedRank = normalizeBotRank(rank);
  if(normalizedRank in BOT_RANK_STATS) {
    return BOT_RANK_STATS[normalizedRank] - BOT_RANK_STATS[''];
  }

  return BOT_RANK_STEP * BigInt(
    Array.from(normalizedRank).reduce(
      (total, rankCharacter) => total + (RANK_Z_CHAR_CODE - rankCharacter.charCodeAt(0)),
      0,
    ),
  );
}

function normalizeBotRank(rank) {
  const normalizedRank = typeof rank === 'string' ? rank.trim().toUpperCase() : '';
  return BOT_RANK_PATTERN.test(normalizedRank) ? normalizedRank : '';
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
