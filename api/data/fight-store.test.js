import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {getStoredFight, loadFightStore, storeFight} from './fight-store.js';


describe('loadFightStore', () => {
  it('indexes unresolved fights by player id and discards extras for duplicate players', async () => {
    const newestFight = {attacker: 11, defender: 22, id: 3, victory: null};
    const olderDuplicateFight = {attacker: 11, defender: null, id: 2, victory: null};
    const otherFight = {attacker: 33, defender: null, id: 1, victory: null};
    const fights = {listActive: async () => [newestFight, olderDuplicateFight, otherFight]};
    const fighters = {
      find: async (fighterID) => {
        if(fighterID === 11) {
          return {id: 11, player: 5};
        }
        if(fighterID === 22) {
          return {id: 22, player: 8};
        }
        if(fighterID === 33) {
          return {id: 33, player: 9};
        }
        return null;
      },
    };

    const store = await loadFightStore({fighters, fights});

    assert.equal(store.get(5), newestFight);
    assert.equal(store.get(8), newestFight);
    assert.equal(store.get(9), otherFight);
    assert.equal(store.size, 3);
  });
});

describe('getStoredFight', () => {
  it('returns null for missing entries', () => {
    assert.equal(getStoredFight(new Map(), 5), null);
  });
});

describe('storeFight', () => {
  it('does not overwrite an existing player fight', () => {
    const firstFight = {id: 1};
    const store = new Map([[5, firstFight]]);

    storeFight(store, 5, {id: 2});

    assert.equal(store.get(5), firstFight);
  });
});
