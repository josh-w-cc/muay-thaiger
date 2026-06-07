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

export async function getPlayerState({fighterActions, fightJudge, fighters}, playerID) {
  const fighter = await fighters.findCurrentByPlayerID(playerID);
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
  const payload = {actions, cmd: 'player_state', fighter};
  if(fight) {
    payload.fight = fight;
  }
  socket.send(JSON.stringify(payload));
}

export async function syncPlayerState({fighterActions, fightJudge, fighters}, sockets) {
  for(const socket of sockets) {
    if(shouldRemoveSocket(socket)) {
      sockets.delete(socket);
      continue;
    }
    if(!canSyncSocketPlayer(fightJudge, socket)) {
      continue;
    }
    const state = await getPlayerState({fighterActions, fightJudge, fighters}, socket.player.id);
    if(state) {
      sendPlayerState(state.actions, state.fighter, socket, state.fight);
    }
  }
}

function isSocketOpen(socket) {
  return socket.readyState === socket.OPEN;
}

function shouldRemoveSocket(socket) {
  return !isSocketOpen(socket);
}

function canSyncSocketPlayer(fightJudge, socket) {
  if(!socket.player) {
    return false;
  }
  return Boolean(fightJudge?.get(socket.player.id));
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
