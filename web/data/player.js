import {create} from 'zustand';

const usePlayerStore = create((set) => ({
  ...getInitialState(),
  clearToken: () => set({token: null}),
  setPlayerID: (playerID) => set({playerID}),
  setToken: (token) => set({token}),
  selectFighter: (race) => set({selectedRace: race}),
}));
export default usePlayerStore;


export const resetPlayerStore = () => {
  usePlayerStore.setState(getInitialState());
};

function getInitialState() {
  return {
    playerID: null,
    selectedRace: null,
    token: null,
  };
}
