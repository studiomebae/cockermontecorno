import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({
  server: { host: '0.0.0.0', port: 5173 },
  build: { rollupOptions: { input: { italian: resolve('index.html'), english: resolve('en/index.html') } } }
});
