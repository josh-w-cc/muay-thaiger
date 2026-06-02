import {FIGHTER_STAT_KEYS} from 'shared/stats.js';
import {isFightReason, normalizeFightReason} from 'shared/fights.js';
import {createCommandError} from './command-errors.js';

const BOT_BASE_STAT = 100n;
const BOT_RANK_MULTIPLIER_BASE = 10n;
const BOT_RANK_MULTIPLIER_DIVISOR = 4n;
const BOT_SINGLE_CHAR_RANK_PATTERN = /^[A-Z]$/;
const BOT_MULTI_CHAR_RANK_PATTERN = /^(?:ZZ|A{2,5})$/;
const RANK_Z_CHAR_CODE = 'Z'.charCodeAt(0);

export async function createFight({fighters, fights, fightJudge}, playerID, reason, rank = '') {
  const normalizedReason = normalizeFightReason(reason);
  const normalizedRank = normalizeFightRank(rank);
  validateFightMessage(playerID, normalizedReason);
  const fighter = await getCurrentFighter(fighters, playerID);
  const fight = await fights.create({
    attacker: {
      id: fighter.id,
      race: fighter.race,
      stats: captureFightStats(fighter),
    },
    defender: normalizedReason === 'gold' ? {id: null, race: 1, stats: createBotStats(normalizedRank)} : null,
    rank: normalizedRank,
    reason: normalizedReason,
  });
  await fightJudge.attach(fighters, fight);
  return fight;
}

function captureFightStats(fighter) {
  return Object.fromEntries(
    FIGHTER_STAT_KEYS.map((stat) => [stat, (fighter[stat] ?? fighter.stats?.[stat] ?? 0).toString()]),
  );
}

function createBotStats(rank) {
  const baseStat = BOT_BASE_STAT * getBotRankMultiplier(rank);
  return Object.fromEntries(
    FIGHTER_STAT_KEYS.map((stat) => [stat, baseStat.toString()]),
  );
}

function normalizeFightRank(rank) {
  return typeof rank === 'string' ? rank.trim() : '';
}

function getBotRankMultiplier(rank) {
  const normalizedRank = normalizeBotRank(rank);
  if(!normalizedRank || normalizedRank === 'ZZ') {
    return 1n;
  }

  return BOT_RANK_MULTIPLIER_BASE ** getBotRankExponent(normalizedRank);
}

function normalizeBotRank(rank) {
  const normalizedRank = typeof rank === 'string' ? rank.trim().toUpperCase() : '';
  return (BOT_SINGLE_CHAR_RANK_PATTERN.test(normalizedRank) || BOT_MULTI_CHAR_RANK_PATTERN.test(normalizedRank))
    ? normalizedRank
    : '';
}

function getBotRankExponent(normalizedRank) {
  const rankScore = getBotRankScore(normalizedRank) / BOT_RANK_MULTIPLIER_DIVISOR;
  return rankScore > 0n ? rankScore : 1n;
}

function getBotRankScore(normalizedRank) {
  return Array.from(normalizedRank).reduce(
    (total, character) => total + BigInt(RANK_Z_CHAR_CODE - character.charCodeAt(0)),
    0n,
  );
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
