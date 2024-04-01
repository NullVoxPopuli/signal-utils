import { basename } from "node:path";
import { createRequire } from "node:module";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { globbySync } from "globby";
import { babel } from "@rollup/plugin-babel";

const require = createRequire(import.meta.url);
const manifest = require("./package.json");

let entryFiles = globbySync("src/*.ts", { ignore: ["**/*.d.ts"] });

let entries: Record<string, string> = {};

for (let entry of entryFiles) {
  let name = basename(entry);
  entries[name] = entry;
}

export default defineConfig({
  // esbuild in vite does not support decorators
  // https://github.com/evanw/esbuild/issues/104
  esbuild: false,
  build: {
    outDir: "dist",
    // These targets are not "support".
    // A consuming app or library should compile further if they need to support
    // old browsers.
    target: ["esnext", "firefox121"],
    // In case folks debug without sourcemaps
    //
    // TODO: do a dual build, split for development + production
    // where production is optimized for CDN loading via
    // https://limber.glimdown.com
    minify: false,
    sourcemap: true,
    rollupOptions: {
      output: {
        dir: "dist",
        entryFileNames: "[name]",
        experimentalMinChunkSize: 0,
        format: "es",
        hoistTransitiveImports: false,
        sourcemap: true,
      },
      external: [
        ...Object.keys(manifest.dependencies || {}),
        ...Object.keys(manifest.peerDependencies || {}),
      ],
    },
    lib: {
      entry: entries,
      name: "signal-utils",
      formats: ["es"],
    },
  },
  plugins: [
    babel({
      babelHelpers: "inline",
      extensions: [".js", ".ts"],
    }),
    dts({
      rollupTypes: true,
      outDir: "declarations",
    }),
  ],
});
