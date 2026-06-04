import {FIGHTER_STAT_KEYS} from 'shared/stats.js';
import {MOVE_IDS} from 'shared/moves.js';

const BOT_BASE_STAT = 100n;
const BOT_MOVE_IDS = [MOVE_IDS.wildPunch, MOVE_IDS.wildKick];
const BOT_RANK_MULTIPLIER_BASE = 10n;
const BOT_RANK_MULTIPLIER_DIVISOR = 4n;
const BOT_RACE = 1;
const BOT_SINGLE_CHAR_RANK_PATTERN = /^[A-Z]$/;
const BOT_MULTI_CHAR_RANK_PATTERN = /^(?:ZZ|A{2,5})$/;
const RANK_Z_CHAR_CODE = 'Z'.charCodeAt(0);

export function createBot(rank) {
  return {
    id: null,
    moves: BOT_MOVE_IDS,
    race: BOT_RACE,
    stats: createBotStats(rank),
  };
}

export function createBotStats(rank) {
  const baseStat = BOT_BASE_STAT * getBotRankMultiplier(rank);
  return Object.fromEntries(
    FIGHTER_STAT_KEYS.map((stat) => [stat, baseStat.toString()]),
  );
}

export function normalizeFightRank(rank) {
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
