import {create} from 'zustand';
import {getTrainingProgressByActionKey} from 'shared/training.js';

import {TickerState} from '@/pages/Game/Ticker.js';
import {runFighterActionTick, transferLatestTouchedAt} from './fighterActionTick.js';

const useFighterActionsStore = create((set) => ({
  ...getInitialState(),
  addAction: (action) => set((state) => {
    const nextActions = [...state.actions, normalizeAction(action)];
    return {actions: setActionProgress(nextActions)};
  }),
  removeAction: (actionID) => set((state) => {
    const removedActions = state.actions.filter((action) => action.action === actionID);
    const remainingActions = state.actions.filter((action) => action.action !== actionID);
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
  const progressByIndex = getTrainingProgressByActionKey(actions);
  return actions.map((action, index) => ({...action, progress: progressByIndex.get(index) || 0}));
}

function tickActions(actions) {
  return setActionProgress(runFighterActionTick(actions));
}

TickerState.addListener(() => useFighterActionsStore.getState().tick());
