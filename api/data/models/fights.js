import {
  generateFindFn,
  generateListFn,
  generateRemoveFn,
} from '../utils/crud.js';
import {serializeFightCreate} from './fight-create.js';
import {normalizeFightRow, removeFightByID, upsertFightByPlayerID} from './fight-store.js';


export default function fights(db) {
  const activeFightByPlayerID = new Map();
  let activeFightByPlayerIDLoaded = false;
  const markLoaded = () => {
    activeFightByPlayerIDLoaded = true;
  };
  return {
    create: (data) => createFight(db, activeFightByPlayerID, data, markLoaded),
    find: generateFindFn(db, 'fights'),
    findActiveByFighterID: (fighterID) => findActiveFightByFighterID(db, fighterID),
    findActiveByPlayerID: (playerID) => findActiveFightByPlayerID(activeFightByPlayerID, playerID, activeFightByPlayerIDLoaded),
    isActiveByPlayerIDLoaded: () => activeFightByPlayerIDLoaded,
    list: generateListFn(db, 'fights', 'created_at'),
    loadActiveByPlayerID: () => loadActiveFightByPlayerID(db, activeFightByPlayerID, markLoaded),
    remove: generateRemoveFn(db, 'fights'),
    update: (id, data) => updateFight(db, activeFightByPlayerID, id, data, markLoaded),
  };
}

async function createFight(db, activeFightByPlayerID, data, markLoaded) {
  const fight = await db('fights').insert(serializeFightCreate(data)).returning('*').then((rows) => rows[0]);
  markLoaded();
  const playerIDs = await findFightPlayerIDs(db, fight);
  upsertFightByPlayerID(activeFightByPlayerID, fight, playerIDs, true);
  return fight;
}

async function findActiveFightByFighterID(db, fighterID) {
  return db('fights')
    .whereNull('victory')
    .whereRaw('(attacker = ? OR defender = ?)', [fighterID, fighterID])
    .orderBy('created_at', 'desc')
    .first();
}

function findActiveFightByPlayerID(activeFightByPlayerID, playerID, isLoaded) {
  if(!isLoaded) {
    return undefined;
  }
  if(!playerID) {
    return null;
  }
  return activeFightByPlayerID.get(String(playerID)) || null;
}

async function findFightPlayerIDs(db, fight) {
  if(!fight) {
    return [];
  }
  const fighterIDs = [fight.attacker, fight.defender].filter(Boolean);
  if(!fighterIDs.length) {
    return [];
  }
  const players = await db('fighters')
    .whereIn('id', fighterIDs)
    .select('player');
  return players.map(({player}) => player).filter(Boolean);
}

async function loadActiveFightByPlayerID(db, activeFightByPlayerID, markLoaded) {
  const fights = await db('fights')
    .leftJoin('fighters as attacker_fighter', 'attacker_fighter.id', 'fights.attacker')
    .leftJoin('fighters as defender_fighter', 'defender_fighter.id', 'fights.defender')
    .select('fights.*', 'attacker_fighter.player as attacker_player', 'defender_fighter.player as defender_player')
    .whereNull('fights.victory')
    .orderBy('fights.created_at', 'desc');
  activeFightByPlayerID.clear();
  for(const row of fights) {
    const fight = normalizeFightRow(row);
    const playerIDs = [row.attacker_player, row.defender_player];
    upsertFightByPlayerID(activeFightByPlayerID, fight, playerIDs, false);
  }
  markLoaded();
}

async function updateFight(db, activeFightByPlayerID, id, data, markLoaded) {
  const fight = await db('fights').where({id}).update(data).returning('*').then((rows) => rows[0]);
  markLoaded();
  removeFightByID(activeFightByPlayerID, fight?.id);
  if(fight?.victory === null) {
    const playerIDs = await findFightPlayerIDs(db, fight);
    upsertFightByPlayerID(activeFightByPlayerID, fight, playerIDs, true);
  }
  return fight;
}
