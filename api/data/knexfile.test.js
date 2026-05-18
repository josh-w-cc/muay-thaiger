import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {describe, it} from 'node:test';
import {fileURLToPath} from 'node:url';


describe('knexfile defaults', () => {
  it('uses tiger as the default database name', async () => {
    const path = fileURLToPath(new URL('./knexfile.js', import.meta.url));
    const contents = await readFile(path, 'utf8');

    assert.equal(
      contents.includes('postgresql://postgres:postgres@localhost:5333/tiger'),
      true,
    );
  });
});
