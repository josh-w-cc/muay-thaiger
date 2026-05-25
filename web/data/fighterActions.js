import {create} from 'zustand';

import {TickerState} from '@/pages/Game/Ticker.js';
import {findLatestAction, getScheduledActions, runFighterActionTick} from './fighterActionTick.js';

const useFighterActionsStore = create((set) => ({
  ...getInitialState(),
  addAction: (action) => set((state) => {
    const nextActions = [...state.actions, normalizeAction({
      ...action,
      created_at: getOptimisticCreatedAt(state.actions),
    })];
    return {actions: setActionProgress(nextActions)};
  }),
  removeAction: (actionID) => set((state) => ({
    actions: setActionProgress(state.actions.filter((action) => action.action_id !== actionID)),
  })),
  setActions: (actions) => set({actions: setActionProgress(actions.map((action) => normalizeAction(action)))}),
  tick: () => set((state) => ({actions: tickActions(state.actions)})),
}));

export default useFighterActionsStore;


export function resetFighterActionsStore() {
  useFighterActionsStore.setState(getInitialState());
}


function getInitialState() {
  return {
    actions: [],
  };
}

function normalizeAction(action) {
  return {
    ...action,
    created_at: action?.created_at || new Date().toISOString(),
    progress: Number.isFinite(action?.progress) ? action.progress : 0,
  };
}

function getOptimisticCreatedAt(actions) {
  const nowMs = Date.now();
  const scheduledActions = getScheduledActions(actions);
  if(!scheduledActions.length) {
    return new Date(nowMs).toISOString();
  }
  const {latestActionIndex, latestActionTime} = findLatestAction(scheduledActions, nowMs);
  const currentActionIndex = (latestActionIndex + 1) % scheduledActions.length;
  if(currentActionIndex === 0) {
    return new Date(latestActionTime).toISOString();
  }
  return new Date(latestActionTime - 1).toISOString();
}

function setActionProgress(actions) {
  const nowMs = Date.now();
  const progressByIndex = new Map(actions.map((_, index) => [index, 0]));
  const scheduledActions = getScheduledActions(actions);
  setScheduledActionProgress(progressByIndex, scheduledActions, nowMs);
  return actions.map((action, index) => ({...action, progress: progressByIndex.get(index) || 0}));
}

function setScheduledActionProgress(progressByIndex, scheduledActions, nowMs) {
  if(!scheduledActions.length) {
    return;
  }
  const {latestActionIndex, latestActionTime} = findLatestAction(scheduledActions, nowMs);
  let remainingMs = nowMs - latestActionTime;
  if(remainingMs <= 0) {
    return;
  }
  let actionIndex = (latestActionIndex + 1) % scheduledActions.length;
  while(remainingMs >= scheduledActions[actionIndex].durationMs) {
    remainingMs -= scheduledActions[actionIndex].durationMs;
    actionIndex = (actionIndex + 1) % scheduledActions.length;
  }
  progressByIndex.set(
    scheduledActions[actionIndex].index,
    Math.floor(remainingMs / scheduledActions[actionIndex].durationMs * 100),
  );
}

function tickActions(actions) {
  return setActionProgress(runFighterActionTick(actions));
}

TickerState.addListener(() => useFighterActionsStore.getState().tick());
