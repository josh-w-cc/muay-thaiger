import {deepEqual, equal} from 'node:assert/strict';
import {describe, it} from 'node:test';

import {parseJSON} from './json.js';


describe('parseJSON', () => {
  it('parses valid JSON', () => {
    deepEqual(parseJSON('{"cmd":"auth"}'), {cmd: 'auth'});
  });

  it('returns null for invalid JSON', () => {
    equal(parseJSON('{'), null);
  });
});
