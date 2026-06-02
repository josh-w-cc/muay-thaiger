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

function serializeFightCreate({attacker, attackerStats, defender, defenderStats, rank, reason}) {
  return {
    attacker,
    defender,
    details: {
      attacker: serializeParticipantDetails(attackerStats),
      ...(defenderStats ? {defender: serializeParticipantDetails(defenderStats)} : {}),
    },
    rank,
    reason,
  };
}

function serializeParticipantDetails(stats) {
  return {
    starting_stats: serializeStats(stats),
    stats: serializeStats(stats),
  };
}

function serializeStats(stats) {
  return Object.fromEntries(
    Object.entries(stats ?? {}).map(([key, value]) => [key, value.toString()]),
  );
}

async function findActiveFightByFighterID(db, fighterID) {
  return db('fights')
    .whereNull('victory')
    .whereRaw('(attacker = ? OR defender = ?)', [fighterID, fighterID])
    .orderBy('created_at', 'desc')
    .first();
}
