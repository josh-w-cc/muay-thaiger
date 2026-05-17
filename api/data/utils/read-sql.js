import {readFile} from 'node:fs/promises';
import {dirname, join} from 'node:path';


export default function readSQL(importMetaURL, filename) {
  const dir = dirname(new URL(importMetaURL).pathname);
  return readFile(join(dir, filename), 'utf8');
}
