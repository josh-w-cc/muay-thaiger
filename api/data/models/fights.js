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
    listUnresolved: () => listUnresolvedFights(db),
    remove: generateRemoveFn(db, 'fights'),
    update: generateUpdateFn(db, 'fights'),
  };
}

function serializeFightCreate({attacker, defender, rank, reason}) {
  const details = serializeFightDetails(attacker, defender);
  return {
    attacker: attacker.id,
    defender: defender?.id ?? null,
    details,
    rank,
    reason,
  };
}

function serializeFightDetails(attacker, defender) {
  const serializedAttacker = serializeParticipantDetails(attacker);
  if(!defender) {
    return {attacker: serializedAttacker};
  }

  return {
    attacker: serializedAttacker,
    defender: serializeParticipantDetails(defender),
  };
}

function serializeParticipantDetails(participant) {
  validateParticipantDetails(participant);
  return {
    race: participant.race,
    starting_stats: serializeStats(participant.stats),
    stats: serializeStats(participant.stats),
  };
}

function validateParticipantDetails(participant) {
  if(!participant?.race || !hasStats(participant?.stats)) {
    throw new TypeError('invalid-fight-stats');
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

async function listUnresolvedFights(db) {
  return db('fights')
    .whereNull('victory')
    .orderBy('created_at', 'desc');
}
