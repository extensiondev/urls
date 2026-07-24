// ██╗███╗   ██╗████████╗███████╗ ██████╗ ██████╗ ██╗████████╗██╗   ██╗
// ██║████╗  ██║╚══██╔══╝██╔════╝██╔════╝ ██╔══██╗██║╚══██╔══╝╚██╗ ██╔╝
// ██║██╔██╗ ██║   ██║   █████╗  ██║  ███╗██████╔╝██║   ██║    ╚████╔╝
// ██║██║╚██╗██║   ██║   ██╔══╝  ██║   ██║██╔══██╗██║   ██║     ╚██╔╝
// ██║██║ ╚████║   ██║   ███████╗╚██████╔╝██║  ██║██║   ██║      ██║
// ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝   ╚═╝      ╚═╝
// Apache License 2.0 (c) 2026 Cezar Augusto and the extension.dev collaborators

import * as path from "path";
import { defineConfig } from "@rslib/core";

// Three public entry points map to the three subpath exports (`.`, `./paths`,
// `./origins`). rslib names each output by its entry key, so this emits
// dist/index.js, dist/paths.js, dist/origins.js plus matching .d.ts files.
export default defineConfig({
  source: {
    tsconfigPath: "./tsconfig.build.json",
    entry: {
      index: path.resolve(__dirname, "./src/index.ts"),
      paths: path.resolve(__dirname, "./src/paths.ts"),
      origins: path.resolve(__dirname, "./src/origins.ts"),
    },
  },
  lib: [
    {
      format: "cjs",
      syntax: "es2021",
      dts: true,
    },
  ],
});
