import {create} from 'zustand';

export const FIGHT_IN_PROGRESS = 'in-progress';
export const FIGHT_LOST = 'lost';
export const FIGHT_NOT_STARTED = 'not-started';
export const FIGHT_WON = 'won';

const useFightStore = create((set) => ({
  ...getInitialFightState(),
  syncServerState: (fight) => set(getServerFightState(fight)),
}));

export default useFightStore;

export function resetFightStore() {
  useFightStore.setState(getInitialFightState());
}

function getInitialFightState() {
  return {
    attacker: null,
    defender: null,
    details: null,
    fighters: [],
    id: null,
    messages: [],
    reason: null,
    state: FIGHT_NOT_STARTED,
    victory: null,
  };
}

function getServerFightState(fight) {
  const nextFight = getInitialFightState();
  if(!fight || typeof fight !== 'object') {
    return nextFight;
  }
  Object.keys(nextFight).forEach((key) => {
    const value = fight[key];
    if(value !== undefined) {
      nextFight[key] = value;
    }
  });
  return nextFight;
}
