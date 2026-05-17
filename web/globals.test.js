import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

describe('globals.css', () => {
  it('uses original background token', () => {
    const filePath = resolve(process.cwd(), 'globals.css');
    const content = readFileSync(filePath, 'utf8');
    expect(content).toContain('--color-bg: #333333;');
    expect(content).toContain('--color-fg: rgba(255, 255, 255, 0.87);');
  });
});
