import {readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

describe('globals.css', () => {
  it('uses original background and foreground tokens', () => {
    const directoryPath = dirname(fileURLToPath(import.meta.url));
    const filePath = resolve(directoryPath, 'globals.css');
    const content = readFileSync(filePath, 'utf8');
    expect(content).toMatch(/^\s*--color-bg:\s*#333333;\s*$/m);
    expect(content).toMatch(/^\s*--color-fg:\s*rgba\(255,\s*255,\s*255,\s*0.87\);\s*$/m);
  });
});
