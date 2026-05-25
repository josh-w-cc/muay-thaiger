import {create} from 'zustand';

import {parseGold} from '@/utils/gold.js';


export const COST_MULTIPLIER = 100;


const useInventoryStore = create((set) => ({
  ...getInitialState(),
  buy(fighter, item) {
    const cost = BigInt(item.cost) * BigInt(COST_MULTIPLIER);

    if(parseGold(fighter.gold) < cost) {
      return;
    }
    set((state) => ({items: [...state.items, item]}));
    fighter.spend(cost);
  },
}));

export default useInventoryStore;


export function resetInventoryStore() {
  useInventoryStore.setState(getInitialState());
}


function getInitialState() {
  return {
    items: [],
  };
}
