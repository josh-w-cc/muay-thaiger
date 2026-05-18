import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {describe, it} from 'node:test';


describe('characters table SQL', () => {
  it('defines retired with a false default', async () => {
    const sql = await readFile(new URL('./characters.sql', import.meta.url), 'utf8');

    assert.match(sql, /retired BOOLEAN NOT NULL DEFAULT FALSE/);
  });
});
