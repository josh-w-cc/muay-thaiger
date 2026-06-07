import fighterActionsModel from '../data/models/fighter-actions.js';
import fightersModel from '../data/models/fighters.js';
import {applyTraining} from './training.js';
import {getSocketFighterID} from './socket-fighter.js';
const HOUR_IN_MILLISECONDS = 60 * 60 * 1000;

export async function applyOfflineTraining(db, models = null) {
  const {fighterActions, fighters} = getOfflineTrainingModels(db, models);
  const staleBefore = new Date(Date.now() - HOUR_IN_MILLISECONDS);
  const staleActions = await fighterActions.listStaleBefore(staleBefore);
  const fighterIDs = [...new Set(staleActions.map(({fighter: fighterID}) => fighterID))];
  for(const fighterID of fighterIDs) {
    const fighter = await fighters.find(fighterID);
    if(!shouldSyncOfflineFighter(fighter)) {
      continue;
    }
    await applyTraining({fighterActions, fighters}, fighter);
  }
}

export async function getPlayerState({fighterActions, fightJudge, fighters}, playerID, fighterID = null) {
  const fighter = await getPlayerFighter(fighters, playerID, fighterID);
  if(!fighter) {
    return null;
  }
  const {actions, fighter: updatedFighter} = await applyTraining({fighterActions, fighters}, fighter);
  const state = {actions, fighter: updatedFighter};
  const fight = getActiveFight(fightJudge, playerID);
  if(fight) {
    state.fight = fight;
  }
  return state;
}
function getActiveFight(fightJudge, playerID) {
  return fightJudge.get(playerID);
}
export function sendPlayerState(actions, fighter, socket, fight = null) {
  socket.fighter = fighter;
  const payload = {actions, cmd: 'player_state', fighter};
  if(fight) {
    payload.fight = fight;
  }
  socket.send(JSON.stringify(payload));
}
export async function syncPlayerState({fighterActions, fightJudge, fighters}, sockets) {
  for(const socket of sockets) {
    if(!isSocketOpen(socket)) {
      sockets.delete(socket);
      continue;
    }
    if(!socket.player) {
      continue;
    }
    const state = await getPlayerState({fighterActions, fightJudge, fighters}, socket.player.id, getSocketFighterID(socket));
    if(!state) {
      delete socket.fighter;
      continue;
    }
    sendPlayerState(state.actions, state.fighter, socket, state.fight);
  }
}
function isSocketOpen(socket) {
  return socket.readyState === socket.OPEN;
}
async function getPlayerFighter(fighters, playerID, fighterID) {
  const fighter = await findAttachedFighter(fighters, fighterID);
  if(isCurrentPlayerFighter(fighter, playerID)) {
    return fighter;
  }
  return typeof fighters.findCurrentByPlayerID !== 'function' ? null : fighters.findCurrentByPlayerID(playerID);
}
async function findAttachedFighter(fighters, fighterID) {
  if(!Number.isInteger(fighterID) || typeof fighters.find !== 'function') {
    return null;
  }
  return fighters.find(fighterID);
}
function isCurrentPlayerFighter(fighter, playerID) {
  return Boolean(fighter && fighter.player === playerID && !fighter.retired);
}

function createOfflineTrainingModels(db) {
  return {fighterActions: fighterActionsModel(db), fighters: fightersModel(db)};
}

function getOfflineTrainingModels(db, models) {
  return models || createOfflineTrainingModels(db);
}

function shouldSyncOfflineFighter(fighter) {
  return Boolean(fighter && !fighter.retired);
}
