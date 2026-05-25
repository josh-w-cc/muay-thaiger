import {create} from 'zustand';
import {findLatestAction, getActionTime, getScheduledTrainingActions} from 'shared/training.js';

import {TickerState} from '@/pages/Game/Ticker.js';
import {runFighterActionTick, transferLatestTouchedAt} from './fighterActionTick.js';

const useFighterActionsStore = create((set) => ({
  ...getInitialState(),
  addAction: (action) => set((state) => {
    const nextActions = [...state.actions, normalizeAction(action)];
    return {actions: setActionProgress(nextActions)};
  }),
  removeAction: (actionID) => set((state) => {
    const removedActions = state.actions.filter((action) => action.action_id === actionID);
    const remainingActions = state.actions.filter((action) => action.action_id !== actionID);
    return {actions: setActionProgress(transferLatestTouchedAt(removedActions, remainingActions))};
  }),
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

function setActionProgress(actions) {
  const nowMs = Date.now();
  const progressByIndex = new Map(actions.map((_, index) => [index, 0]));
  const scheduledActions = getScheduledTrainingActions(actions);
  setScheduledActionProgress(progressByIndex, scheduledActions, nowMs);
  return actions.map((action, index) => ({...action, progress: progressByIndex.get(index) || 0}));
}

function setScheduledActionProgress(progressByIndex, scheduledActions, nowMs) {
  if(!scheduledActions.length) {
    return;
  }
  const orderedActions = getOrderedScheduledActions(scheduledActions, nowMs);
  const {latestActionTime} = findLatestAction(orderedActions, nowMs);
  let remainingMs = nowMs - latestActionTime;
  if(remainingMs <= 0) {
    return;
  }
  let actionIndex = 0;
  while(remainingMs >= orderedActions[actionIndex].durationMs) {
    remainingMs -= orderedActions[actionIndex].durationMs;
    actionIndex = (actionIndex + 1) % scheduledActions.length;
  }
  progressByIndex.set(
    orderedActions[actionIndex].index,
    Math.floor(remainingMs / orderedActions[actionIndex].durationMs * 100),
  );
}

function tickActions(actions) {
  return setActionProgress(runFighterActionTick(actions));
}

function getOrderedScheduledActions(actions, nowMs) {
  return [...actions].sort((leftAction, rightAction) => {
    const leftTime = getActionTime(leftAction.action, nowMs);
    const rightTime = getActionTime(rightAction.action, nowMs);
    if(leftTime === rightTime) {
      return leftAction.index - rightAction.index;
    }
    return leftTime - rightTime;
  });
}

TickerState.addListener(() => useFighterActionsStore.getState().tick());
