import fighterActionsModel from '../data/models/fighter-actions.js';
import fightersModel from '../data/models/fighters.js';
import {getStoredFight} from '../data/fight-store.js';
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

export async function getPlayerState({fighterActions, fightStore, fights, fighters}, playerID) {
  const fighter = await fighters.findCurrentByPlayerID(playerID);
  if(!fighter) {
    return null;
  }
  const {actions, fighter: updatedFighter} = await applyTraining({fighterActions, fighters}, fighter);
  const state = {actions, fighter: updatedFighter};
  const fight = await getActiveFight({fightStore, fights}, playerID, updatedFighter.id);
  if(fight) {
    state.fight = fight;
  }
  return state;
}

async function getActiveFight({fightStore, fights}, playerID, fighterID) {
  const storedFight = getStoredFight(fightStore, playerID);
  if(storedFight) {
    return storedFight;
  }
  if(!fighterID) {
    return null;
  }
  return fights.findActiveByFighterID(fighterID);
}

export function sendPlayerState(actions, fighter, socket, fight = null) {
  const payload = {actions, cmd: 'player_state', fighter};
  if(fight) {
    payload.fight = fight;
  }
  socket.send(JSON.stringify(payload));
}

export async function syncPlayerState({fighterActions, fights, fighters}, sockets) {
  for(const socket of sockets) {
    if(!isSocketOpen(socket)) {
      sockets.delete(socket);
      continue;
    }
    if(!socket.player) {
      continue;
    }
    const state = await getPlayerState({fighterActions, fights, fighters}, socket.player.id);
    if(state) {
      sendPlayerState(state.actions, state.fighter, socket, state.fight);
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
