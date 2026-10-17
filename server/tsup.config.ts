import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node20',
  outDir: 'dist',
  clean: true,
  // shared is TS source, so bundle it in; real npm deps stay external.
  noExternal: ['@hotel/shared'],
});
