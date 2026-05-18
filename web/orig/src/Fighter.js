import {create} from 'zustand';

import BaseStats, {RACE_STATICS} from './menus/CharacterSelect/BaseStats.js';
import {TickerState} from '../../pages/Game/Ticker.js';


const initialRace = `${RACE_STATICS[0].id}`;

const useFighterStore = create((set, get) => ({
  ...getInitialState(),
  idle(key, action) {
    if(get().idling?.key?.substring(0, 5).toUpperCase() === 'FIGHT') {
      return;
    }

    set((state) => mergeState(state, {idling: {key, action, delta: 0}}));
  },
  select(id) {
    set((state) => mergeState(state, getSelectionState(id)));
  },
  spend(gold) {
    set((state) => mergeState(state, {gold: state.gold - gold}));
  },
  tick(delta) {
    const {idling} = get();
    if(!idling?.action) {
      return;
    }

    if(idling.key.substring(0, 5).toLowerCase() === 'train') {
      set((state) => mergeState(state, {
        idling: {
          ...idling,
          delta: idling.delta + delta,
        },
      }));

      const {idling: idlingAfterDeltaUpdate} = get();
      if(idlingAfterDeltaUpdate.delta > 1000) {
        idlingAfterDeltaUpdate.action();
        const {idling: idlingAfterAction} = get();
        if(idlingAfterAction) {
          set((state) => mergeState(state, {
            idling: {
              ...idlingAfterAction,
              delta: idlingAfterAction.delta - 1000,
            },
          }));
        }
      }
    }
    else if(idling.action(delta)) {
      set((state) => mergeState(state, {idling: false}));
    }
  },
  train(stat, amount = 1) {
    if(get().idling?.key?.substring(0, 5).toUpperCase() === 'FIGHT') {
      return;
    }

    const trainingEffect = getTrainingEffect(get());
    if(Object.hasOwn(trainingEffect, stat)) {
      set((state) => mergeState(state, {
        [stat]: state[stat] + trainingEffect[stat] * amount,
      }));
      return;
    }

    console.error('Tried to train unknown stat:', stat);
  },
  win(gold) {
    set((state) => mergeState(state, {gold: state.gold + gold}));
  },
}));

export default useFighterStore;


export function resetFighterStore() {
  useFighterStore.setState((state) => mergeState(state, getInitialState()));
}


function getCombatState({agility, constitution, durability, reach, skill, stamina, strength}) {
  return {
    apm: Math.max(0, Math.log(agility)) + Math.sqrt(skill),
    attack: Math.max(0, Math.log(stamina)) + Math.sqrt(agility) + skill + reach,
    defense: Math.max(0, Math.log(agility)) + Math.sqrt(stamina) + skill,
    health: stamina + constitution * constitution + durability * durability,
    power: (strength + agility) * Math.sqrt(stamina) + skill,
  };
}

function getInitialState() {
  return {
    gold: 0,
    idling: false,
    ...getSelectionState(initialRace),
  };
}

function mergeState(state, updates) {
  const nextState = {
    ...state,
    ...updates,
  };

  return {
    ...nextState,
    ...getCombatState(nextState),
  };
}

function getSelectionState(id) {
  const stats = BaseStats[id].stats;
  const nextState = {
    agility: 0,
    anima: stats.anima,
    constitution: 0,
    durability: stats.durability,
    innateStrength: stats.strength,
    race: id,
    reach: stats.reach,
    skill: 0,
    speed: stats.speed,
    stamina: 0,
    strength: 0,
    vitality: stats.vitality,
  };

  return {
    ...nextState,
    ...getCombatState(nextState),
  };
}

function getTrainingEffect({anima, innateStrength, speed, vitality}) {
  return {
    agility: speed,
    constitution: vitality,
    skill: anima,
    stamina: vitality,
    strength: innateStrength,
  };
}

TickerState.addListener((delta) => useFighterStore.getState().tick(delta));
