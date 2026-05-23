import {create} from 'zustand';
import {SKILL_DEFINITIONS, SKILL_IDS} from 'shared/skills.js';

import {TickerState} from '@/pages/Game/Ticker.js';
import {runFighterActionTick} from './fighterActionTick.js';


const SKILLS_BY_ACTION_ID = Object.freeze(
  Object.fromEntries(
    Object.entries(SKILL_IDS).map(([skillKey, id]) => [id, SKILL_DEFINITIONS[skillKey]]),
  ),
);

const useFighterActionsStore = create((set) => ({
  ...getInitialState(),
  addAction: (action) => set((state) => {
    const nextActions = [...state.actions, normalizeAction(action)];
    return {actions: setActionProgress(nextActions)};
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

function findLatestAction(scheduledActions, nowMs) {
  let latestActionIndex = 0;
  let latestActionTime = getActionTime(scheduledActions[latestActionIndex].action, nowMs);
  for(let index = 1; index < scheduledActions.length; index += 1) {
    const actionTime = getActionTime(scheduledActions[index].action, nowMs);
    if(actionTime >= latestActionTime) {
      latestActionIndex = index;
      latestActionTime = actionTime;
    }
  }
  return {latestActionIndex, latestActionTime};
}

function getActionTime(action, nowMs) {
  const actionTime = Date.parse(action.touched_at || action.created_at || '');
  if(Number.isNaN(actionTime)) {
    return nowMs;
  }
  return actionTime;
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

function getScheduledActions(actions) {
  return actions
    .map((action, index) => ({action, durationMs: (SKILLS_BY_ACTION_ID[action.action_id]?.duration || 0) * 1000, index}))
    .filter((action) => action.durationMs > 0);
}

TickerState.addListener(() => useFighterActionsStore.getState().tick());
