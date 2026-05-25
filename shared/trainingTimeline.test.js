import {deepEqual, equal} from 'node:assert/strict';
import {describe, it} from 'node:test';

import {createTrainingTimeline, getActionTime} from './trainingTimeline.js';


describe('createTrainingTimeline', () => {
  it('returns empty results when no scheduled actions have positive duration', () => {
    const actions = [{id: 1}];

    const result = createTrainingTimeline(actions, {
      getDurationMs: () => 0,
      now: new Date('2026-01-01T00:00:01.000Z'),
    });

    deepEqual(result.appliedActions, []);
    equal(result.touchedAtByActionKey.size, 0);
  });

  it('applies actions in queued order and tracks touched time by custom keys', () => {
    const actions = [
      {action_id: 2, id: 5, touched_at: '2026-01-01T00:00:00.000Z'},
      {action_id: 4, id: 6, touched_at: '2026-01-01T00:00:00.000Z'},
    ];
    const durationsByActionID = new Map([[2, 1000], [4, 2000]]);

    const result = createTrainingTimeline(actions, {
      getDurationMs: (action) => durationsByActionID.get(action.action_id) || 0,
      getTouchedAtKey: (action) => action.id,
      now: new Date('2026-01-01T00:00:05.000Z'),
    });

    deepEqual(result.appliedActions, [actions[0], actions[1], actions[0]]);
    equal(result.touchedAtByActionKey.get(5).toISOString(), '2026-01-01T00:00:04.000Z');
    equal(result.touchedAtByActionKey.get(6).toISOString(), '2026-01-01T00:00:03.000Z');
  });

  it('supports custom touched_at value transforms', () => {
    const actions = [{action_id: 2, touched_at: '2026-01-01T00:00:00.000Z'}];

    const result = createTrainingTimeline(actions, {
      getDurationMs: () => 1000,
      getTouchedAtValue: (touchedAt) => touchedAt.toISOString(),
      now: new Date('2026-01-01T00:00:02.000Z'),
    });

    equal(result.touchedAtByActionKey.get(0), '2026-01-01T00:00:02.000Z');
  });
});

describe('getActionTime', () => {
  it('falls back to now for invalid action timestamps', () => {
    equal(getActionTime({created_at: 'invalid-date'}, 12345), 12345);
  });
});
