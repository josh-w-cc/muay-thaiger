import {create} from 'zustand';

import {TickerState} from '../../pages/Game/Ticker.js';


export const COST_MULTIPLIER = 100;
const INVENTORY_TICKER_LISTENER_KEY = 'muayThaigerInventoryTickerListenerRegistered';


const useInventoryStore = create((set) => ({
  ...getInitialState(),
  buy(fighter, item) {
    if(fighter.gold < item.cost * COST_MULTIPLIER) {
      return;
    }
    set((state) => ({items: [...state.items, item]}));
    fighter.spend(item.cost * COST_MULTIPLIER);
  },

  tick() {},
}));

registerTickerListener();

export default useInventoryStore;


export function resetInventoryStore() {
  useInventoryStore.setState(getInitialState());
}


function getInitialState() {
  return {
    items: [],
  };
}

function registerTickerListener() {
  if(globalThis[INVENTORY_TICKER_LISTENER_KEY]) {
    return;
  }
  TickerState.addListener((delta) => useInventoryStore.getState().tick(delta));
  globalThis[INVENTORY_TICKER_LISTENER_KEY] = true;
}
