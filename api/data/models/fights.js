import {
  generateCreateFn,
  generateFindFn,
  generateListFn,
  generateRemoveFn,
  generateUpdateFn,
} from '../utils/crud.js';


export default function fights(db) {
  const create = generateCreateFn(db, 'fights');

  return {
    create: (fight) => create(serializeFightCreate(fight)),
    find: generateFindFn(db, 'fights'),
    findActiveByFighterID: (fighterID) => findActiveFightByFighterID(db, fighterID),
    list: generateListFn(db, 'fights', 'created_at'),
    remove: generateRemoveFn(db, 'fights'),
    update: generateUpdateFn(db, 'fights'),
  };
}

function serializeFightCreate({attacker, defender, rank, reason}) {
  const serializedAttacker = serializeParticipant(attacker, true);
  const serializedDefender = serializeParticipant(defender);
  if(!hasStats(serializedAttacker.details.stats)) {
    throw new TypeError('invalid-fight-stats');
  }

  return {
    attacker: serializedAttacker.id,
    defender: serializedDefender.id,
    details: serializeFightDetails(serializedAttacker.details, serializedDefender.details),
    rank,
    reason,
  };
}

function serializeParticipant(participant, isRequired = false) {
  return {
    details: serializeParticipantDetails(participant, isRequired),
    id: participant?.id ?? null,
  };
}

function serializeFightDetails(attacker, defender) {
  if(!defender) {
    return {attacker};
  }

  return {attacker, defender};
}

function throwInvalidFightStats() {
  throw new TypeError('invalid-fight-stats');
}

function serializeParticipantDetails(participant, isRequired = false) {
  if(!participant) {
    if(isRequired) {
      throwInvalidFightStats();
    }

    return null;
  }

  validateParticipantDetails(participant);

  return {
    race: participant.race,
    starting_stats: serializeStats(participant.stats),
    stats: serializeStats(participant.stats),
  };
}

function validateParticipantDetails(participant) {
  if(participant.race == null || !hasStats(participant.stats)) {
    throwInvalidFightStats();
  }
}

function hasStats(stats) {
  if(!stats || typeof stats !== 'object' || Array.isArray(stats)) {
    return false;
  }

  return Object.keys(stats).length > 0;
}

function serializeStats(stats) {
  if(!stats || typeof stats !== 'object' || Array.isArray(stats)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(stats).map(([key, value]) => [key, value.toString()]),
  );
}

async function findActiveFightByFighterID(db, fighterID) {
  return db('fights')
    .whereNull('victory')
    .whereRaw('(attacker = ? OR defender = ?)', [fighterID, fighterID])
    .orderBy('created_at', 'desc')
    .first();
}
