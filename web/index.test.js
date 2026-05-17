import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';


const webDirectory = path.dirname(fileURLToPath(import.meta.url));


describe('index.html', () => {
  it('sets the app title to Muay Thaiger', () => {
    const indexHTMLContent = fs.readFileSync(path.join(webDirectory, 'index.html'), 'utf8');
    expect(indexHTMLContent).toContain('<title>Muay Thaiger</title>');
  });
});
