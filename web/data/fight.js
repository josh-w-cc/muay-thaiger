import {create} from 'zustand';

export const FIGHT_IN_PROGRESS = 'in-progress';
export const FIGHT_LOST = 'lost';
export const FIGHT_NOT_STARTED = 'not-started';
export const FIGHT_WON = 'won';

const useFightStore = create((set) => ({
  ...getInitialState(),
  syncServerState: (fight) => set({
    ...getInitialFightState(),
    ...(fight || {}),
  }),
}));

export default useFightStore;

export function resetFightStore() {
  useFightStore.setState(getInitialState());
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

function getInitialState() {
  return {
    ...getInitialFightState(),
    attack: () => '',
    finish: () => undefined,
  };
}
