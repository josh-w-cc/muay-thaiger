import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {describe, it} from 'node:test';
import {fileURLToPath} from 'node:url';

const playersSQLPath = fileURLToPath(new URL('./players.sql', import.meta.url));

describe('players.sql', () => {
  it('defines cheater as bounded float defaulting to zero', async () => {
    const sql = await readFile(playersSQLPath, 'utf8');

    assert.match(
      sql,
      /cheater DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK \(cheater >= 0 AND cheater <= 1\),/,
    );
  });
});
