import {deepEqual, equal} from 'node:assert/strict';
import {describe, it} from 'node:test';

import {
  applyTrainingAction,
  applyTrainingActions,
  createTrainingTimeline,
  findLatestAction,
  getActionTime,
  getScheduledTrainingActions,
  getTrainedStatValue,
  getTrainingDurationMs,
  getTrainingEffect,
} from './training.js';


describe('applyTrainingAction', () => {
  it('applies the shared skill definition for the given action', () => {
    const calls = [];
    const fighter = {
      train: (stat, multiplier = 1n) => calls.push(['train', stat, multiplier]),
      win: (amount) => calls.push(['win', amount]),
    };

    applyTrainingAction({action_id: 7}, fighter);

    deepEqual(calls, [
      ['win', 100],
      ['train', 'stamina', 1n],
      ['train', 'strength', 1n],
      ['train', 'constitution', 1n],
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
      train: (stat, multiplier = 1n) => calls.push(['train', stat, multiplier]),
      win: (amount) => calls.push(['win', amount]),
    };

    applyTrainingActions([
      {action_id: 2},
      {action_id: 7},
    ], fighter);

    deepEqual(calls, [
      ['train', 'stamina', 1n],
      ['win', 100],
      ['train', 'stamina', 1n],
      ['train', 'strength', 1n],
      ['train', 'constitution', 1n],
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
    deepEqual(getTrainingEffect({anima: 2n, speed: 3n, vigor: 5n, vitality: 7n}), {
      agility: 3n,
      constitution: 7n,
      skill: 2n,
      stamina: 7n,
      strength: 5n,
    });
  });
});

describe('getTrainedStatValue', () => {
  it('returns the next trained stat value from fighter stats', () => {
    equal(getTrainedStatValue({stamina: 3n, vitality: 7n}, 'stamina', 2n), 17n);
  });

  it('uses zero when the trained stat has not been initialized', () => {
    equal(getTrainedStatValue({vitality: 7n}, 'stamina', 2n), 14n);
  });

  it('returns null for unknown training stats', () => {
    equal(getTrainedStatValue({vitality: 7}, 'charisma'), null);
  });
});

describe('timeline helper exports', () => {
  it('exposes findLatestAction from the shared training module', () => {
    const actions = [
      {action: {touched_at: '2026-01-01T00:00:00.000Z'}, durationMs: 1000, index: 0},
      {action: {touched_at: '2026-01-01T00:00:01.000Z'}, durationMs: 1000, index: 1},
    ];

    deepEqual(findLatestAction(actions, Date.parse('2026-01-01T00:00:03.000Z')), {
      latestActionIndex: 1,
      latestActionTime: Date.parse('2026-01-01T00:00:01.000Z'),
    });
  });

  it('exposes getActionTime from the shared training module', () => {
    equal(getActionTime({created_at: 'invalid-date'}, 12345), 12345);
  });
});
