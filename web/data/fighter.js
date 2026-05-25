import {getTrainedStatValue} from 'shared/training.js';
import {create} from 'zustand';

import {TickerState} from '@/pages/Game/Ticker.js';
import {
  getInitialState,
  getSelectionState,
  isFightIdling,
  mergeState,
} from './fighterState.js';
import {buildStateFromServerFighter} from './serverFighterState.js';

const useFighterStore = create((set, get) => ({
  ...getInitialState(),
  idle: generateIdleFn({get, set}),
  overwrite: generateOverwriteFn(set),
  select: generateSelectFn(set),
  spend: generateSpendFn(set),
  tick: generateTickFn({get, set}),
  train: generateTrainFn({get, set}),
  win: generateWinFn(set),
}));

export default useFighterStore;
export function resetFighterStore() {
  useFighterStore.setState((state) => mergeState(state, getInitialState()));
}

function generateIdleFn({get, set}) {
  return (key, action) => {
    if(isFightIdling(get().idling)) {
      return;
    }

    set((state) => mergeState(state, {idling: {action, delta: 0, key}}));
  };
}

function generateOverwriteFn(set) {
  return (fighter) => set((state) => mergeState(state, buildStateFromServerFighter(fighter)));
}

function generateSelectFn(set) {
  return (id) => set((state) => mergeState(state, getSelectionState(id)));
}

function generateSpendFn(set) {
  return (gold) => set((state) => mergeState(state, {gold: state.gold - BigInt(gold)}));
}

function generateTickFn({get, set}) {
  return (delta) => {
    const {idling} = get();
    if(!idling?.action) {
      return;
    }

    if(idling.action(delta)) {
      set((state) => mergeState(state, {idling: false}));
    }
  };
}

function generateTrainFn({get, set}) {
  return (stat, multiplier = 1) => {
    const trainedStatValue = getTrainedStatValue(get(), stat, multiplier);
    if(trainedStatValue === null) {
      console.error('Tried to train unknown stat:', stat);
      return;
    }

    set((state) => mergeState(state, {[stat]: trainedStatValue}));
  };
}

function generateWinFn(set) {
  return (gold) => set((state) => mergeState(state, {gold: state.gold + BigInt(gold)}));
}

TickerState.addListener((delta) => useFighterStore.getState().tick(delta));
