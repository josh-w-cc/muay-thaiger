import {FIGHTER_STAT_KEYS} from 'shared/stats.js';
import {isFightReason, normalizeFightReason} from 'shared/fights.js';
import {createCommandError} from '../command-errors.js';
import {createBotStats, normalizeFightRank} from './bot.js';

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
  await fightJudge?.attach(fighters, fight);
  return fight;
}

function captureFightStats(fighter) {
  return Object.fromEntries(
    FIGHTER_STAT_KEYS.map((stat) => [stat, (fighter[stat] ?? fighter.stats?.[stat] ?? 0).toString()]),
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
