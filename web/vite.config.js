import react from '@vitejs/plugin-react';
import {defineConfig, transformWithOxc} from 'vite';


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

const apiTarget = process.env.VITE_API_URL || 'http://localhost:3334';

export default defineConfig({
  optimizeDeps: {
    rolldownOptions: {
      moduleTypes: {'.js': 'jsx'},
    },
  },
  plugins: [react(), jsxInJs()],
  resolve: {
    alias: {
      '@': new URL('.', import.meta.url).pathname,
    },
  },
  server: {
    allowedHosts: ['web'],
    proxy: {
      '/api': {
        changeOrigin: true,
        target: apiTarget,
        ws: true,
      },
      '/ws': {
        changeOrigin: true,
        target: apiTarget,
        ws: true,
      },
    },
  },
});
