import {FIGHTER_STAT_KEYS} from 'shared/stats.js';
import {isFightReason, normalizeFightReason} from 'shared/fights.js';
import {createCommandError} from '../websocket/command-errors.js';
import {createBot, normalizeFightRank} from './bot.js';

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
  const moves = await captureFightMoves(fighterMoves, fighter.id);
  return {
    id: fighter.id,
    moves,
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
  const lastUsed = Date.now();
  const moves = await fighterMoves.listEnabledByFighterID(fighterID);
  return moves.map(({move}) => ({id: move, lastUsed}));
}

function createGoldFightDefender(reason, rank) {
  return reason === 'gold'
    ? createBot(rank)
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
