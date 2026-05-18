import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {withFoundItem} from './route-handlers.js';


describe('withFoundItem', () => {
  it('returns not found when model does not return an item', async () => {
    const reply = {
      code: (statusCode) => ({
        send: (body) => ({body, statusCode}),
      }),
    };
    const req = {
      params: {id: '4'},
    };
    const model = {
      find: async () => undefined,
    };

    const result = await withFoundItem(model, () => 'should-not-be-called')(req, reply);

    assert.deepEqual(result, {body: {error: 'Not found'}, statusCode: 404});
  });

  it('returns the handler result when model finds an item', async () => {
    const reply = {};
    const req = {
      params: {id: '4'},
    };
    const item = {id: 4};
    const model = {
      find: async () => item,
    };

    const result = await withFoundItem(model, (foundItem) => ({foundItem}))(req, reply);

    assert.deepEqual(result, {foundItem: item});
  });
});
