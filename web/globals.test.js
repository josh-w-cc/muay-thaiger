import {readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

describe('globals.css', () => {
  it('uses original background and foreground tokens', () => {
    const directoryPath = dirname(fileURLToPath(import.meta.url));
    const filePath = resolve(directoryPath, 'globals.css');
    const content = readFileSync(filePath, 'utf8');
    expect(content).toContain('--color-bg: #333333;');
    expect(content).toContain('--color-fg: rgba(255, 255, 255, 0.87);');
  });
});
