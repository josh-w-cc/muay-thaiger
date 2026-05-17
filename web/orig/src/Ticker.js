import React from 'react';
import {createStore} from 'zustand/vanilla';


const tickerStore = createStore(() => ({
  actions: [],
  lastAction: +new Date(),
}));

export const TickerState = {
  addListener(action) {
    tickerStore.setState((state) => ({actions: [...state.actions, action]}));
  },

  get actions() {
    return tickerStore.getState().actions;
  },

  get lastAction() {
    return tickerStore.getState().lastAction;
  },

  tick() {
    const {actions, lastAction} = tickerStore.getState();
    if(!actions.length) {
      return;
    }

    const now = +new Date();
    if(lastAction < now) {
      const delta = now - lastAction;
      tickerStore.setState({lastAction: now});
      actions.forEach((action) => action(delta));
    }
  },
};

setInterval(TickerState.tick, 10);
export default React.createContext(TickerState);
