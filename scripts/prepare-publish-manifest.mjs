// ██╗███╗   ██╗████████╗███████╗ ██████╗ ██████╗ ██╗████████╗██╗   ██╗
// ██║████╗  ██║╚══██╔══╝██╔════╝██╔════╝ ██╔══██╗██║╚══██╔══╝╚██╗ ██╔╝
// ██║██╔██╗ ██║   ██║   █████╗  ██║  ███╗██████╔╝██║   ██║    ╚████╔╝
// ██║██║╚██╗██║   ██║   ██╔══╝  ██║   ██║██╔══██╗██║   ██║     ╚██╔╝
// ██║██║ ╚████║   ██║   ███████╗╚██████╔╝██║  ██║██║   ██║      ██║
// ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝   ╚═╝      ╚═╝
// Apache License 2.0 (c) 2026 Cezar Augusto and the extension.dev collaborators

// The checked-in package.json points `exports` at the TypeScript sources, so
// the extension.dev monorepo can link this repository as a submodule and
// consume it with no build step. Published consumers need the compiled files
// instead, and those entry points live under `publishConfig`.
//
// pnpm applies `publishConfig` field overrides on publish; npm does not, and
// the release workflow publishes with npm because OIDC trusted publishing
// lives there. So lift the overrides into the real fields right before the
// publish step. Run this only in CI on a throwaway checkout: it rewrites
// package.json in place.

import { readFileSync, writeFileSync } from "node:fs";

const LIFTED_FIELDS = ["main", "module", "types", "typings", "exports", "bin"];
const manifestPath = new URL("../package.json", import.meta.url);
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const publishConfig = manifest.publishConfig ?? {};

const lifted = [];
for (const field of LIFTED_FIELDS) {
  if (!Object.prototype.hasOwnProperty.call(publishConfig, field)) continue;
  manifest[field] = publishConfig[field];
  delete publishConfig[field];
  lifted.push(field);
}

if (lifted.length === 0) {
  console.error(
    "publishConfig declares no entry-point overrides. Publishing would ship " +
      "the source-pointing exports, which are not in the published files list.",
  );
  process.exit(1);
}

manifest.publishConfig = publishConfig;
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Lifted publishConfig entry points: ${lifted.join(", ")}`);
