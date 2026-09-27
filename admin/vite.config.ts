import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'admin',
  base: './',
  plugins: [react()],
  build: { outDir: '../dist/admin', emptyOutDir: true },
});
