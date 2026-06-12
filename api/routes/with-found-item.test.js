import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {withFoundItem} from './with-found-item.js';


describe('withFoundItem', () => {
  it('returns a 404 reply when the item is missing', () => {
    const sent = [];
    const reply = {
      code(statusCode) {
        sent.push(['code', statusCode]);
        return this;
      },
      send(payload) {
        sent.push(['send', payload]);
        return {payload, statusCode: 404};
      },
    };

    const result = withFoundItem(undefined, reply);

    assert.deepEqual(sent, [
      ['code', 404],
      ['send', {error: 'Not found'}],
    ]);
    assert.deepEqual(result, {payload: {error: 'Not found'}, statusCode: 404});
  });

  it('returns the transformed item when it exists', () => {
    const result = withFoundItem({id: 1}, {}, ({id}) => ({fighterID: id}));

    assert.deepEqual(result, {fighterID: 1});
  });
});
