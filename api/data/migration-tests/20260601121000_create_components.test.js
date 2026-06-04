import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {down, up} from '../migrations/20260601121000_create_components.js';
import createMockKnex from './mock-knex.js';


describe('20260601121000_create_components migration', () => {
  it('creates components and entity_components tables', async () => {
    const {calls, knex} = createMockKnex();

    await up(knex);

    assert.equal(calls.length, 2);
    assert.match(calls[0], /CREATE TABLE IF NOT EXISTS components/);
    assert.match(calls[0], /component_key TEXT NOT NULL UNIQUE/);
    assert.match(calls[0], /CREATE OR REPLACE TRIGGER components_updated_at/);
    assert.match(calls[1], /CREATE TABLE IF NOT EXISTS entity_components/);
    assert.match(calls[1], /entity BIGINT NOT NULL REFERENCES entities\(id\) ON DELETE CASCADE/);
    assert.match(calls[1], /component BIGINT NOT NULL REFERENCES components\(id\) ON DELETE CASCADE/);
    assert.match(calls[1], /data JSONB NOT NULL DEFAULT '\{\}'::JSONB/);
    assert.match(calls[1], /UNIQUE\(entity, component\)/);
    assert.match(calls[1], /CREATE OR REPLACE TRIGGER entity_components_updated_at/);
  });

  it('drops entity_components and components on rollback', async () => {
    const {calls, knex} = createMockKnex();

    await down(knex);

    assert.deepEqual(calls, [
      'DROP TABLE IF EXISTS entity_components CASCADE',
      'DROP TABLE IF EXISTS components CASCADE',
    ]);
  });
});
