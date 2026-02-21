import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  bundle: true,
  format: ['esm'],
  target: 'node22',
  platform: 'node',
  sourcemap: false,
  clean: true,
  outDir: 'dist',
  splitting: false
})
