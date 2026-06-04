import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {castStats, castStatsRows, serializeStats} from './stats.js';


describe('castStats', () => {
  it('converts stats values from strings to BigInt', () => {
    const row = {id: 1, stats: {speed: '10', vigor: '9'}};
    const result = castStats(row);
    assert.deepEqual(result.stats, {speed: 10n, vigor: 9n});
  });

  it('returns null when the row is null', () => {
    assert.equal(castStats(null), null);
  });

  it('returns the row unchanged when stats are missing', () => {
    const row = {id: 1};
    assert.deepEqual(castStats(row), {id: 1});
  });
});

describe('castStatsRows', () => {
  it('casts stats for each row in an array', () => {
    const rows = [{id: 1, stats: {speed: '5'}}, {id: 2, stats: {speed: '8'}}];
    const result = castStatsRows(rows);
    assert.deepEqual(result, [{id: 1, stats: {speed: 5n}}, {id: 2, stats: {speed: 8n}}]);
  });

  it('casts a single row when not an array', () => {
    const row = {id: 1, stats: {speed: '5'}};
    const result = castStatsRows(row);
    assert.deepEqual(result, {id: 1, stats: {speed: 5n}});
  });
});

describe('serializeStats', () => {
  it('converts BigInt stat values to strings', () => {
    const stats = {speed: 10n, vigor: 9n};
    assert.deepEqual(serializeStats(stats), {speed: '10', vigor: '9'});
  });

  it('converts number stat values to strings', () => {
    const stats = {speed: 10, vigor: 9};
    assert.deepEqual(serializeStats(stats), {speed: '10', vigor: '9'});
  });

  it('converts string stat values via toString', () => {
    const stats = {speed: '10', vigor: '9'};
    assert.deepEqual(serializeStats(stats), {speed: '10', vigor: '9'});
  });

  it('returns an empty object for null input', () => {
    assert.deepEqual(serializeStats(null), {});
  });

  it('returns an empty object for array input', () => {
    assert.deepEqual(serializeStats([]), {});
  });

  it('returns an empty object for non-object input', () => {
    assert.deepEqual(serializeStats('stats'), {});
  });

  it('returns an empty object for an empty object', () => {
    assert.deepEqual(serializeStats({}), {});
  });
});
