import {create} from 'zustand';


export const COST_MULTIPLIER = 100;


const useInventoryStore = create((set) => ({
  ...getInitialState(),
  buy(fighter, item) {
    if(fighter.gold < BigInt(item.cost * COST_MULTIPLIER)) {
      return;
    }
    set((state) => ({items: [...state.items, item]}));
    fighter.spend(item.cost * COST_MULTIPLIER);
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
