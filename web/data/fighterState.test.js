import BaseStats from './baseStats.js';
import {getSelectionState, isFightIdling, isTrainIdling, tickTrain} from './fighterState.js';


describe('fighterState helpers', () => {
  it('identifies fight and training idle keys defensively', () => {
    expect(isFightIdling()).toBe(false);
    expect(isFightIdling({key: 'FIGHT-club'})).toBe(true);
    expect(isTrainIdling()).toBe(false);
    expect(isTrainIdling({key: 'shop-refresh'})).toBe(false);
    expect(isTrainIdling({key: 'train-strength'})).toBe(true);
  });

  it('increments training idle progress without firing before one second', () => {
    const action = vi.fn();
    const state = {
      idling: {action, delta: 200, key: 'train-strength'},
    };

    tickTrain({
      delta: 800,
      get: () => state,
      idling: state.idling,
      set(update) {
        Object.assign(state, update(state));
      },
    });

    expect(action).not.toHaveBeenCalled();
    expect(state.idling.delta).toBe(1000);
  });

  it('leaves idling cleared when training completion removes it', () => {
    const state = {
      idling: {
        action() {
          state.idling = false;
        },
        delta: 1000,
        key: 'train-strength',
      },
    };

    tickTrain({
      delta: 5,
      get: () => state,
      idling: state.idling,
      set(update) {
        Object.assign(state, update(state));
      },
    });

    expect(state.idling).toBe(false);
  });

  it('falls back to legacy race strength when innateStrength is missing', () => {
    const raceID = '1';
    const stats = BaseStats[raceID].stats;
    BaseStats[raceID].stats = {...stats, innateStrength: undefined, strength: 7};
    try {
      const state = getSelectionState(raceID);

      expect(state.innateStrength).toBe(7);
    }
    finally {
      BaseStats[raceID].stats = stats;
    }
  });
});
