import {create} from 'zustand';

import {TickerState} from '../../pages/Game/Ticker.js';


const useInventoryStore = create((set, get) => ({
  ...getInitialState(),
  buy(fighter, item) {
    if(fighter.gold < item.cost * 100) {
      return;
    }
    set((state) => ({items: [...state.items, item]}));
    fighter.spend(item.cost * 100);
  },

  tick(delta) {
    console.log(delta);
    console.log(get().items);
  },
}));

TickerState.addListener((delta) => useInventoryStore.getState().tick(delta));

export default useInventoryStore;


export function resetInventoryStore() {
  useInventoryStore.setState(getInitialState());
}


function getInitialState() {
  return {
    items: [],
  };
}
