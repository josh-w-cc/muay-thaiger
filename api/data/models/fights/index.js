import {randomInt} from 'node:crypto';

import {
  generateCreateFn,
  generateFindFn,
  generateListFn,
  generateRemoveFn,
  generateUpdateFn,
} from '../../utils/crud.js';
import {castFight, castFightRows} from './fights.js';


export default function fights(db) {
  const create = generateCreateFn(db, 'fights');
  const find = generateFindFn(db, 'fights');
  const list = generateListFn(db, 'fights', 'created_at');
  const update = generateUpdateFn(db, 'fights');

  return {
    create: async (fight) => castFight(await create(serializeFightCreate(fight))),
    find: async (id) => castFight(await find(id)),
    findActiveByFighterID: (fighterID) => findActiveFightByFighterID(db, fighterID),
    list: async (direction) => castFightRows(await list(direction)),
    listUnresolved: () => listUnresolvedFights(db),
    remove: generateRemoveFn(db, 'fights'),
    update: async (id, data) => castFight(await update(id, data)),
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
    moveCount: participant.moveCount ?? 0,
    moves: participant.moves,
    race: participant.race,
    seed: randomInt(2 ** 32),
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
  return Object.fromEntries(
    Object.entries(stats).map(([key, value]) => [key, value.toString()]),
  );
}

async function findActiveFightByFighterID(db, fighterID) {
  const fight = await db('fights')
    .whereNull('victory')
    .whereRaw('(attacker = ? OR defender = ?)', [fighterID, fighterID])
    .orderBy('created_at', 'desc')
    .first();

  return castFight(fight);
}

async function listUnresolvedFights(db) {
  const fights = await db('fights')
    .whereNull('victory')
    .orderBy('created_at', 'desc');

  return castFightRows(fights);
}
