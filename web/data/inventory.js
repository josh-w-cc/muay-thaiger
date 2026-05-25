import {create} from 'zustand';


export const COST_MULTIPLIER = 100;


const useInventoryStore = create((set) => ({
  ...getInitialState(),
  buy(fighter, item) {
    const cost = BigInt(item.cost * COST_MULTIPLIER);
    if(fighter.gold < cost) {
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
