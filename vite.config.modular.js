import { defineConfig } from 'vite';

export default defineConfig({
  // Entry point for modular version
  build: {
    rollupOptions: {
      input: {
        main: 'index-modular.html',
      },
    },
    outDir: 'dist-modular',
  },
  // Ensure public files are copied
  publicDir: 'public',
  // Dev server options
  server: {
    port: 5174,
  },
  preview: {
    port: 4174,
  },
});
