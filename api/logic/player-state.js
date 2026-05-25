import fighterActionsModel from '../data/models/fighter-actions.js';
import fightersModel from '../data/models/fighters.js';
import {applyTraining} from './training.js';

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

export async function getPlayerState({fighterActions, fighters}, playerID) {
  const fighter = await fighters.findCurrentByPlayerID(playerID);
  if(!fighter) {
    return null;
  }
  const {actions, fighter: updatedFighter} = await applyTraining({fighterActions, fighters}, fighter);
  return {actions, fighter: updatedFighter};
}

export function sendPlayerState(actions, fighter, socket) {
  socket.send(JSON.stringify({actions, cmd: 'player_state', fighter}));
}

export async function syncPlayerState({fighterActions, fighters}, sockets) {
  for(const socket of sockets) {
    if(!isSocketOpen(socket)) {
      sockets.delete(socket);
      continue;
    }
    if(!socket.player) {
      continue;
    }
    const state = await getPlayerState({fighterActions, fighters}, socket.player.id);
    if(state) {
      sendPlayerState(state.actions, state.fighter, socket);
    }
  }
}

function isSocketOpen(socket) {
  return socket.readyState === socket.OPEN;
}

function createOfflineTrainingModels(db) {
  return {fighterActions: fighterActionsModel(db), fighters: fightersModel(db)};
}

function getOfflineTrainingModels(db, models) {
  if(models) {
    return models;
  }
  return createOfflineTrainingModels(db);
}

function shouldSyncOfflineFighter(fighter) {
  if(!fighter) {
    return false;
  }
  return !fighter.retired;
}
