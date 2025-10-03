import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['esm'],
  platform: 'node',
  outDir: 'dist',
  clean: true,
  shims: false,
  noExternal: true,
  external: [/^node:/, 'react-devtools-core'],
  treeshake: {
    moduleSideEffects: false,
  },
  rolldownOptions: {
    output: {
      inlineDynamicImports: true,
    },
  },
})
