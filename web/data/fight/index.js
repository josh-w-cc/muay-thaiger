import {create} from 'zustand';

import {createFightActions} from './actions.js';
import {getServerFightState} from './serverState.js';

const useFightStore = create((set) => createFightState(set));

export default useFightStore;

export function resetFightStore() {
  useFightStore.setState(createFightState(useFightStore.setState), true);
}

function createFightState(set, fight = null) {
  return {
    ...getServerFightState(fight),
    pendingFeed: [],
    ...createFightActions(set),
  };
}
