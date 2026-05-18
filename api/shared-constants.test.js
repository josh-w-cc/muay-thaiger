import assert from 'node:assert/strict';
import test from 'node:test';

import {API_PREFIX, WS_PREFIX} from '../shared/constants.js';


test('shared API and websocket prefixes are absolute paths', () => {
  assert.equal(API_PREFIX.startsWith('/'), true);
  assert.equal(WS_PREFIX.startsWith('/'), true);
});
