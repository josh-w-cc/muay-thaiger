import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import FightFighters from './FightFighters.js';

describe('FightFighters', () => {
  it('renders stamina progress bars for both fighters', () => {
    render(<FightFighters />);

    expect(screen.getByRole('progressbar', {name: 'Tiger fighter stamina'})).toHaveAttribute('aria-valuenow', '150');
    expect(screen.getByRole('progressbar', {name: 'Tiger fighter stamina'})).toHaveAttribute('aria-valuemax', '200');
    expect(screen.getByRole('progressbar', {name: 'Snow leopard fighter stamina'})).toHaveAttribute('aria-valuenow', '180');
    expect(screen.getByRole('progressbar', {name: 'Snow leopard fighter stamina'})).toHaveAttribute('aria-valuemax', '200');
  });

  it('defines gold as the primary stamina bar color in Fight.module.css', () => {
    const directoryPath = path.dirname(fileURLToPath(import.meta.url));
    const modulePath = path.join(directoryPath, '..', 'Fight.module.css');
    const source = fs.readFileSync(modulePath, 'utf8');

    expect(source).toContain('box-shadow: inset 0 -3px 6px -3px var(--color-gold-hover), inset 0 3px 6px -3px var(--color-gold-hover);');
    expect(source).toContain('background: linear-gradient(180deg, #ffec9a 0%, var(--color-gold) 25%, var(--color-gold-hover) 75%, black 100%);');
  });
});
