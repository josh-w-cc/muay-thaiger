import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';


const webDirectory = path.dirname(fileURLToPath(import.meta.url));


describe('index.html', () => {
  it('sets favicon links to tiger icon assets', () => {
    const indexHTMLContent = fs.readFileSync(path.join(webDirectory, 'index.html'), 'utf8');
    expect(indexHTMLContent).toContain('<link href="/favicon.ico" rel="icon" sizes="any" />');
    expect(indexHTMLContent).toContain('<link href="/favicon.png" rel="icon" type="image/png" />');
  });

  it('sets the app title to Muay Thaiger', () => {
    const indexHTMLContent = fs.readFileSync(path.join(webDirectory, 'index.html'), 'utf8');
    expect(indexHTMLContent).toContain('<title>Muay Thaiger</title>');
  });
});
