import {deepEqual, equal} from 'node:assert/strict';
import {describe, it} from 'node:test';

import {
  applyTrainingAction,
  applyTrainingActions,
  createTrainingTimeline,
  getActionWithMaxTouchedAt,
  getMaxTouchedAtMs,
  getScheduledTrainingActions,
  getTrainedStatValue,
  getTrainingDurationMs,
  getTrainingEffect,
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

describe('getTrainingEffect', () => {
  it('maps base stats to training multipliers', () => {
    deepEqual(getTrainingEffect({anima: 2, speed: 3, vigor: 5, vitality: 7}), {
      agility: 3,
      constitution: 7,
      skill: 2,
      stamina: 7,
      strength: 5,
    });
  });

  it('defaults missing base stats to zero', () => {
    deepEqual(getTrainingEffect({}), {
      agility: 0,
      constitution: 0,
      skill: 0,
      stamina: 0,
      strength: 0,
    });
  });
});

describe('getTrainedStatValue', () => {
  it('returns the next trained stat value from fighter stats', () => {
    equal(getTrainedStatValue({stamina: 3, vitality: 7}, 'stamina', 2), 17);
  });

  it('uses zero when the trained stat has not been initialized', () => {
    equal(getTrainedStatValue({vitality: 7}, 'stamina', 2), 14);
  });

  it('uses zero when a training multiplier stat has not been initialized', () => {
    equal(getTrainedStatValue({stamina: 3}, 'stamina', 2), 3);
  });

  it('returns null for unknown training stats', () => {
    equal(getTrainedStatValue({vitality: 7}, 'charisma'), null);
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

describe('getActionWithMaxTouchedAt', () => {
  it('returns the action with the latest touched_at', () => {
    const expected = {touched_at: '2026-01-01T00:00:00.111Z'};
    const result = getActionWithMaxTouchedAt([
      {touched_at: '2026-01-01T00:00:00.005Z'},
      expected,
      {touched_at: '2026-01-01T00:00:00.050Z'},
    ]);

    deepEqual(result, expected);
  });

  it('skips actions without a valid touched_at when selecting the target', () => {
    const expected = {touched_at: '2026-01-01T00:00:00.050Z'};
    const result = getActionWithMaxTouchedAt([
      {},
      expected,
      {touched_at: '2026-01-01T00:00:00.005Z'},
    ]);

    deepEqual(result, expected);
  });

  it('returns the first action when none have a valid touched_at', () => {
    const first = {};
    const result = getActionWithMaxTouchedAt([first, {}]);

    deepEqual(result, first);
  });
});
