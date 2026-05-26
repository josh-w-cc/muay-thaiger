import {deepEqual, equal} from 'node:assert/strict';
import {describe, it} from 'node:test';

import {
  applyTrainingAction,
  applyTrainingActions,
  createTrainingTimeline,
  findTouchedAtTransfer,
  getMaxTouchedAtMs,
  getScheduledTrainingActions,
  getTrainingDurationMs,
} from './training.js';


describe('applyTrainingAction', () => {
  it('applies the shared skill definition for the given action', () => {
    const calls = [];
    const fighter = {
      train: (stat, multiplier = 1) => calls.push(['train', stat, multiplier]),
      win: (amount) => calls.push(['win', amount]),
    };

    applyTrainingAction({action_id: 7}, fighter);

    deepEqual(calls, [
      ['win', 100],
      ['train', 'stamina', 1],
      ['train', 'strength', 1],
      ['train', 'constitution', 1],
    ]);
  });

  it('ignores unknown action ids', () => {
    const fighter = {
      train: () => {
        throw new Error('should not train');
      },
      win: () => {
        throw new Error('should not win');
      },
    };

    applyTrainingAction({action_id: 999}, fighter);
  });
});

describe('applyTrainingActions', () => {
  it('applies each action in sequence', () => {
    const calls = [];
    const fighter = {
      train: (stat, multiplier = 1) => calls.push(['train', stat, multiplier]),
      win: (amount) => calls.push(['win', amount]),
    };

    applyTrainingActions([
      {action_id: 2},
      {action_id: 7},
    ], fighter);

    deepEqual(calls, [
      ['train', 'stamina', 1],
      ['win', 100],
      ['train', 'stamina', 1],
      ['train', 'strength', 1],
      ['train', 'constitution', 1],
    ]);
  });
});

describe('getTrainingDurationMs', () => {
  it('returns the shared skill duration in milliseconds', () => {
    equal(getTrainingDurationMs({action_id: 6}), 4000);
  });

  it('returns zero for unknown action ids', () => {
    equal(getTrainingDurationMs({action_id: 999}), 0);
  });
});

describe('createTrainingTimeline', () => {
  it('uses shared training durations for queued actions', () => {
    const actions = [
      {action_id: 2, id: 5, touched_at: '2026-01-01T00:00:00.000Z'},
      {action_id: 4, id: 6, touched_at: '2026-01-01T00:00:00.000Z'},
    ];

    const result = createTrainingTimeline(actions, {
      getTouchedAtKey: (action) => action.id,
      now: new Date('2026-01-01T00:00:03.000Z'),
    });

    deepEqual(result.appliedActions, [actions[0], actions[1]]);
    equal(result.touchedAtByActionKey.get(5).toISOString(), '2026-01-01T00:00:01.000Z');
    equal(result.touchedAtByActionKey.get(6).toISOString(), '2026-01-01T00:00:03.000Z');
  });
});

describe('getScheduledTrainingActions', () => {
  it('returns scheduled actions using shared training durations', () => {
    deepEqual(getScheduledTrainingActions([
      {action_id: 2},
      {action_id: 999},
      {action_id: 6},
    ]), [
      {action: {action_id: 2}, durationMs: 1000, index: 0},
      {action: {action_id: 6}, durationMs: 4000, index: 2},
    ]);
  });
});

describe('getMaxTouchedAtMs', () => {
  it('returns the max touched_at value in milliseconds', () => {
    equal(getMaxTouchedAtMs([
      {touched_at: '2026-01-01T00:00:00.005Z'},
      {touched_at: '2026-01-01T00:00:00.111Z'},
      {touched_at: '2026-01-01T00:00:00.050Z'},
    ]), Date.parse('2026-01-01T00:00:00.111Z'));
  });

  it('ignores actions without a valid touched_at', () => {
    equal(getMaxTouchedAtMs([
      {touched_at: '2026-01-01T00:00:00.005Z'},
      {},
    ]), Date.parse('2026-01-01T00:00:00.005Z'));
  });

  it('returns null when no actions have a valid touched_at', () => {
    equal(getMaxTouchedAtMs([{}, {}]), null);
  });
});

describe('findTouchedAtTransfer', () => {
  it('returns null when remaining actions list is empty', () => {
    equal(findTouchedAtTransfer([{touched_at: '2026-01-01T00:00:00.111Z'}], []), null);
  });

  it('returns null when removed actions have no valid touched_at', () => {
    equal(findTouchedAtTransfer([{}], [{touched_at: '2026-01-01T00:00:00.005Z'}]), null);
  });

  it('returns null when remaining max is already >= removed max', () => {
    const result = findTouchedAtTransfer(
      [{touched_at: '2026-01-01T00:00:00.005Z'}],
      [{touched_at: '2026-01-01T00:00:00.111Z'}],
    );

    equal(result, null);
  });

  it('returns targetAction and touchedAt Date when transfer is needed', () => {
    const remaining = [{touched_at: '2026-01-01T00:00:00.005Z'}];
    const result = findTouchedAtTransfer(
      [{touched_at: '2026-01-01T00:00:00.111Z'}],
      remaining,
    );

    deepEqual(result, {targetAction: remaining[0], touchedAt: new Date('2026-01-01T00:00:00.111Z')});
  });

  it('selects remaining action with latest touched_at as target', () => {
    const oldest = {touched_at: '2026-01-01T00:00:00.005Z'};
    const newest = {touched_at: '2026-01-01T00:00:00.050Z'};
    const result = findTouchedAtTransfer(
      [{touched_at: '2026-01-01T00:00:00.111Z'}],
      [oldest, newest],
    );

    deepEqual(result?.targetAction, newest);
  });

  it('skips remaining actions without a valid touched_at when selecting target', () => {
    const valid = {touched_at: '2026-01-01T00:00:00.050Z'};
    const result = findTouchedAtTransfer(
      [{touched_at: '2026-01-01T00:00:00.111Z'}],
      [{}, valid],
    );

    deepEqual(result?.targetAction, valid);
  });

  it('uses first remaining action as target when none have a valid touched_at', () => {
    const first = {};
    const result = findTouchedAtTransfer(
      [{touched_at: '2026-01-01T00:00:00.111Z'}],
      [first, {}],
    );

    deepEqual(result?.targetAction, first);
  });
});
