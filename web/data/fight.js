import {create} from 'zustand';

import {FIGHT_STATES, generateAttackFn, generateFinishFn, generateForGoldFn, generateStartFn, generateTickFn, getInitialState} from './fightState.js';

export const {IN_PROGRESS: FIGHT_IN_PROGRESS, LOST: FIGHT_LOST, NOT_STARTED: FIGHT_NOT_STARTED, WON: FIGHT_WON} = FIGHT_STATES;

const useFightStore = create((set, get) => ({
  ...getInitialState(),
  attack: generateAttackFn({get, set}),
  finish: generateFinishFn({get, set}),
  forGold: generateForGoldFn({get, set}),
  start: generateStartFn({get, set}),
  tick: generateTickFn({get, set}),
}));

export default useFightStore;

export function resetFightStore() {
  useFightStore.setState(getInitialState());
}
