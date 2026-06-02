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
    create: (data) => create(captureStartingStats(data)),
    find: generateFindFn(db, 'fights'),
    findActiveByFighterID: (fighterID) => findActiveFightByFighterID(db, fighterID),
    list: generateListFn(db, 'fights', 'created_at'),
    remove: generateRemoveFn(db, 'fights'),
    update: generateUpdateFn(db, 'fights'),
  };
}

function captureStartingStats(data) {
  if(!data?.details) {
    return data;
  }

  return {
    ...data,
    details: {
      ...data.details,
      attacker: captureParticipantStartingStats(data.details.attacker),
      defender: captureParticipantStartingStats(data.details.defender),
    },
  };
}

function captureParticipantStartingStats(participant) {
  if(!participant?.stats) {
    return participant;
  }

  const stats = Object.fromEntries(
    Object.entries(participant.stats).map(([key, value]) => [key, value.toString()]),
  );

  return {
    ...participant,
    starting_stats: stats,
    stats,
  };
}

async function findActiveFightByFighterID(db, fighterID) {
  return db('fights')
    .whereNull('victory')
    .whereRaw('(attacker = ? OR defender = ?)', [fighterID, fighterID])
    .orderBy('created_at', 'desc')
    .first();
}
