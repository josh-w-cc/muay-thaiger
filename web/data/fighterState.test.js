import {isFightIdling} from './fighterState.js';


describe('fighterState helpers', () => {
  it('identifies fight idle keys defensively', () => {
    expect(isFightIdling()).toBe(false);
    expect(isFightIdling({key: 'FIGHT-club'})).toBe(true);
  });
});
