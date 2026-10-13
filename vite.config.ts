import { defineConfig } from 'vitest/config';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `base: './'` keeps asset paths relative so the same build works on GitHub Pages
// (served under /pokexo/) and as a Claude artifact. The single-file plugin inlines
// JS, CSS and the JSON pokedex bundle into one index.html.
export default defineConfig({
  base: './',
  plugins: [viteSingleFile()],
  build: { target: 'es2022' },
  test: { include: ['tests/**/*.test.ts'] },
});
