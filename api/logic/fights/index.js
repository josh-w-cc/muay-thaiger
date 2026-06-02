import {FIGHTER_STAT_KEYS} from 'shared/stats.js';
import {MOVE_IDS} from 'shared/moves.js';
import {isFightReason, normalizeFightReason} from 'shared/fights.js';
import {createCommandError} from '../command-errors.js';
import {createBotStats, normalizeFightRank} from './bot.js';

const BOT_MOVE_IDS = [MOVE_IDS.wildPunch, MOVE_IDS.wildKick];

export async function createFight({fighterMoves, fighters, fights, fightJudge}, playerID, reason, rank = '') {
  const normalizedReason = normalizeFightReason(reason);
  const normalizedRank = normalizeFightRank(rank);
  validateFightMessage(playerID, normalizedReason);
  const fighter = await getCurrentFighter(fighters, playerID);
  const fight = await fights.create({
    attacker: await captureFightParticipant(fighterMoves, fighter),
    defender: createGoldFightDefender(normalizedReason, normalizedRank),
    rank: normalizedRank,
    reason: normalizedReason,
  });
  await fightJudge?.attach(fighters, fight);
  return fight;
}

async function captureFightParticipant(fighterMoves, fighter) {
  return {
    id: fighter.id,
    moves: await captureFightMoves(fighterMoves, fighter.id),
    race: fighter.race,
    stats: captureFightStats(fighter),
  };
}

function captureFightStats(fighter) {
  return Object.fromEntries(
    FIGHTER_STAT_KEYS.map((stat) => [stat, (fighter[stat] ?? fighter.stats?.[stat] ?? 0).toString()]),
  );
}

async function captureFightMoves(fighterMoves, fighterID) {
  if(!fighterMoves?.listEnabledByFighterID) {
    return [];
  }

  const moves = await fighterMoves.listEnabledByFighterID(fighterID);
  return moves.map(({move}) => move);
}

function createGoldFightDefender(reason, rank) {
  return reason === 'gold'
    ? {id: null, moves: BOT_MOVE_IDS, race: 1, stats: createBotStats(rank)}
    : null;
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
