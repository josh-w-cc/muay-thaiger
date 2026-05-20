import {create} from 'zustand';

const usePlayerStore = create((set) => ({
  ...getInitialState(),
  clearToken: () => set({token: null}),
  selectFighter: (race) => set({selectedRace: race}),
  setPlayerID: (playerID) => set({playerID}),
  setPlayerName: (playerName) => set({playerName}),
  setToken: (token) => set({token}),
}));
export default usePlayerStore;


export const resetPlayerStore = () => {
  usePlayerStore.setState(getInitialState());
};

function getInitialState() {
  return {
    playerID: null,
    playerName: null,
    selectedRace: null,
    token: null,
  };
}
