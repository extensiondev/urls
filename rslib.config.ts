// ██╗   ██╗██████╗ ██╗     ███████╗
// ██║   ██║██╔══██╗██║     ██╔════╝
// ██║   ██║██████╔╝██║     ███████╗
// ██║   ██║██╔══██╗██║     ╚════██║
// ╚██████╔╝██║  ██║███████╗███████║
//  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝
// Apache License 2.0 (c) 2026 Cezar Augusto and the extension.dev collaborators

import * as path from "path";
import { defineConfig } from "@rslib/core";

export default defineConfig({
  source: {
    tsconfigPath: "./tsconfig.build.json",
    entry: {
      index: path.resolve(__dirname, "./src/index.ts"),
      paths: path.resolve(__dirname, "./src/paths.ts"),
      origins: path.resolve(__dirname, "./src/origins.ts"),
      userland: path.resolve(__dirname, "./src/userland.ts"),
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
