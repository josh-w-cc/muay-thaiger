import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import racesModel from './races.js';
import {mockKnex} from '../utils/mock-knex.js';


describe('races.read', () => {
  it('casts stats to BigInt in find and list reads', async () => {
    const race = {id: 1, name: 'Tiger', stats: {speed: '5'}};
    const {knex: findKnex} = mockKnex(race);
    const {knex: listKnex} = mockKnex([race]);
    const racesForFind = racesModel(findKnex);
    const racesForList = racesModel(listKnex);

    const found = await racesForFind.find(1);
    const listed = await racesForList.list();

    assert.deepEqual(found, {id: 1, name: 'Tiger', stats: {speed: 5n}});
    assert.deepEqual(listed, [{id: 1, name: 'Tiger', stats: {speed: 5n}}]);
  });
});
