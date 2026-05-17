import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';


describe('index.html', () => {
  it('sets the app title to Muay Thaiger', () => {
    const indexPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'index.html');
    const indexContents = fs.readFileSync(indexPath, 'utf8');
    expect(indexContents).toContain('<title>Muay Thaiger</title>');
  });
});
