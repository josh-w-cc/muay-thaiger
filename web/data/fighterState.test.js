import BaseStats from './baseStats.js';
import {getSelectionState} from './fighterState.js';


describe('fighterState helpers', () => {
  it('does not fall back to legacy race strength when vigor is missing', () => {
    const raceID = '1';
    const stats = BaseStats[raceID].stats;
    BaseStats[raceID].stats = {...stats, vigor: undefined, strength: 7};
    try {
      const state = getSelectionState(raceID);

      expect(state.vigor).toBeUndefined();
    }
    finally {
      BaseStats[raceID].stats = stats;
    }
  });
});
