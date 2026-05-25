import {create} from 'zustand';

import {TickerState} from '@/pages/Game/Ticker.js';
import {findLatestAction, getScheduledActions, runFighterActionTick} from './fighterActionTick.js';

const useFighterActionsStore = create((set) => ({
  ...getInitialState(),
  addAction: (action) => set((state) => {
    return {actions: [...state.actions, normalizeAction(action)]};
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
