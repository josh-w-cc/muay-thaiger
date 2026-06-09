import {parseBigIntStats} from 'shared/stats.js';

export function getServerFightState(fight) {
  if(!fight || typeof fight !== 'object') {
    return getInitialFightState();
  }
  return {
    ...getInitialFightState(),
    ...fight,
    details: parseFightDetails(fight.details),
  };
}

function getInitialFightState() {
  return {
    attacker: null, created_at: null,
    defender: null, details: null,
    id: null, rank: null,
    reason: null, updated_at: null,
    victory: null,
  };
}

function parseFightDetails(details) {
  return {
    ...details,
    attacker: parseFightParticipant(details.attacker),
    ...(details.defender ? {defender: parseFightParticipant(details.defender)} : {}),
  };
}

function parseFightParticipant(participant) {
  return {
    ...participant,
    startingStats: parseBigIntStats(participant.startingStats),
    stats: parseBigIntStats(participant.stats),
  };
}
