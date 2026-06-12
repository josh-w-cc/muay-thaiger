import fighterActionsModel from '../../data/models/fighter-actions.js';
import fightersModel from '../../data/models/fighters.js';
import {getScheduledTrainingActions} from 'shared/training.js';
import {applyTraining} from '../training/training.js';

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

export async function getPlayerState({fighterActions, fightJudge, fighters}, playerID, fighter) {
  const fight = getActiveFight(fightJudge, playerID);
  if(fight) {
    const actions = await pauseScheduledActions({fighterActions}, fighter);
    return {actions, fight, fighter};
  }
  const {actions, fighter: updatedFighter} = await applyTraining({fighterActions, fighters}, fighter);
  return {actions, fighter: updatedFighter};
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

export async function syncActiveFighters({fighterActions, fightJudge, fighters}, sockets, playerFilter) {
  const filteredSockets = Array.from(sockets).filter((s) => s.player?.id != null && playerFilter(s.player.id));
  await syncPlayerState({fighterActions, fightJudge, fighters}, new Set(filteredSockets));
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
    await syncPlayerSocketState({fighterActions, fightJudge, fighters}, socket);
  }
}
function isSocketOpen(socket) {
  return socket.readyState === socket.OPEN;
}

async function syncPlayerSocketState({fighterActions, fightJudge, fighters}, socket) {
  const state = await getPlayerState({fighterActions, fightJudge, fighters}, socket.player.id, socket.fighter);
  if(!state) {
    delete socket.fighter;
    return;
  }
  sendPlayerState(state.actions, state.fighter, socket, state.fight);
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

async function pauseScheduledActions({fighterActions}, fighter) {
  const actions = await fighterActions.listByFighterID(fighter.id);
  const scheduledActionIDs = new Set(
    getScheduledTrainingActions(actions).map(({action: scheduledAction}) => scheduledAction.id),
  );
  if(!scheduledActionIDs.size) {
    return actions;
  }
  const scheduledActions = actions.filter((action) => scheduledActionIDs.has(action.id));
  const touchedAt = new Date();
  await Promise.all(scheduledActions.map((action) => fighterActions.touch(action.id, touchedAt)));
  return actions.map((action) => (
    scheduledActionIDs.has(action.id)
      ? {...action, touched_at: touchedAt.toISOString()}
      : action
  ));
}
