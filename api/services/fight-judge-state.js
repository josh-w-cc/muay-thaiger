import {calculateFighterHealth, calculateFighterStats} from './fight-judge-utils.js';

export function getCalculatedFight(fight, participantRole) {
  const {attacker, defender, ...rest} = fight.details;
  const feed = rest.feed.map((entry) => ({...entry, isSelf: entry.actorRole === participantRole}));
  return {
    ...fight,
    details: {
      attacker: addCalculatedStats(attacker),
      ...(defender ? {defender: addCalculatedStats(defender)} : {}),
      ...rest,
      feed,
    },
  };
}

export function captureStartingStats(fight) {
  const {attacker, defender, ...rest} = fight.details;
  return {
    ...fight,
    details: {
      attacker: addStartingStats(attacker),
      ...(defender ? {defender: addStartingStats(defender)} : {}),
      ...rest,
      feed: [],
    },
  };
}

export function getFightMoveOrThrow(participantFight, moveID) {
  const move = participantFight.fight.details[participantFight.role].moves.find(({id}) => id === moveID) || null;
  return move ?? fail(`Unknown move:${moveID}`);
}

export function getOpponentParticipant(participantFight) {
  const role = participantFight.role === 'attacker' ? 'defender' : 'attacker';
  return participantFight.fight.details[role];
}

export function getParticipantFight(fightsByPlayerID, playerID) {
  return fightsByPlayerID.get(playerID) ?? fail(`No fight for player:${playerID}`);
}

export function removeFightByID(fightsByPlayerID, fightID) {
  const playerIDs = [];
  for(const [playerID, participantFight] of fightsByPlayerID.entries()) {
    if(participantFight.fight.id === fightID) {
      playerIDs.push(playerID);
    }
  }
  for(const playerID of playerIDs) {
    fightsByPlayerID.delete(playerID);
  }
}

function addCalculatedStats(participant) {
  return {...participant, stats: {...participant.stats, ...calculateFighterStats(participant.stats)}};
}

function addStartingStats(participant) {
  const health = calculateFighterHealth(participant.stats);
  participant.stats.health = health;
  return {
    ...participant,
    moveList: [],
    startingStats: {
      ...participant.stats,
      health,
    },
  };
}

function fail(message) {
  throw new Error(message);
}
