import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.tsx"],
  format: ["esm"],
  platform: "node",
  outDir: "dist",
  clean: true,
  shims: false,
  external: [
    /^node:/,
    "react",
    "react-devtools-core",
    "ink",
    "ink-select-input",
    "ink-syntax-highlight",
    "figures",
    "nanostores",
    "@nanostores/react",
  ],
  treeshake: {
    moduleSideEffects: false,
  },
  rolldownOptions: {
    output: {
      inlineDynamicImports: true,
    },
  },
});
