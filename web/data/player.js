import {create} from 'zustand';

const usePlayerStore = create((set) => ({
  ...getInitialState(),
  selectFighter: (race) => set({selectedRace: race}),
  setPlayerID: (playerID) => set({playerID}),
  setPlayerName: (playerName) => set({playerName}),
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
  };
}
