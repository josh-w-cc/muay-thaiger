import react from '@vitejs/plugin-react';
import {transformWithOxc} from 'vite';
import {defineConfig} from 'vitest/config';


function jsxInJs() {
  return {
    enforce: 'pre',
    name: 'jsx-in-js',
    async transform(code, id) {
      if(!id.endsWith('.js')) {
        return null;
      }
      return transformWithOxc(code, id, {lang: 'jsx'});
    },
  };
}

export default defineConfig({
  plugins: [react(), jsxInJs()],
  resolve: {
    alias: {
      '@': new URL('..', import.meta.url).pathname,
    },
  },
  test: {
    coverage: {
      exclude: [
        '**/*.{avif,gif,ico,jpeg,jpg,png,svg,webp}',
        'config/**',
        'dist/**',
        'index.html',
        'main.js',
        'vite.config.js',
        '**/*.css',
        '**/mock-*.js',
      ],
      thresholds: {
        branches: 95,
        functions: 95,
        lines: 95,
        statements: 95,
      },
    },
    environment: 'jsdom',
    globals: true,
    include: ['**/*.test.js'],
    setupFiles: ['./config/vitest.setup.js'],
  },
});
