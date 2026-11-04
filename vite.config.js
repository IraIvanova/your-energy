import { defineConfig } from 'vite';
import injectHTML from 'vite-plugin-html-inject';
import FullReload from 'vite-plugin-full-reload';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  base: '/your-energy/',
  plugins: [injectHTML(), FullReload(['src/**/*.html'])],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
});
