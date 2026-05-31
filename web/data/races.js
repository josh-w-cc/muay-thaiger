import {parseBigIntStats} from 'shared/stats.js';
import {create} from 'zustand';

const useRacesStore = create((set) => ({
  ...getInitialState(),
  setRaces: (races) => set({races: normalizeRaces(races)}),
}));
export default useRacesStore;


export function resetRacesStore() {
  useRacesStore.setState(getInitialState());
}

function getInitialState() {
  return {
    races: [],
  };
}

function normalizeRaces(races) {
  if(!Array.isArray(races)) {
    return [];
  }

  return races.map((race) => ({
    ...race,
    stats: parseBigIntStats(race?.stats ?? {}),
  }));
}
