import {create} from 'zustand';


const useFighterActionsStore = create((set) => ({
  ...getInitialState(),
  addAction: (action) => set((state) => ({actions: [...state.actions, action]})),
  setActions: (actions) => set({actions}),
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
