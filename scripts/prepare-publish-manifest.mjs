// ██╗   ██╗██████╗ ██╗     ███████╗
// ██║   ██║██╔══██╗██║     ██╔════╝
// ██║   ██║██████╔╝██║     ███████╗
// ██║   ██║██╔══██╗██║     ╚════██║
// ╚██████╔╝██║  ██║███████╗███████║
//  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝
// Apache License 2.0 (c) 2026 Cezar Augusto and the extension.dev collaborators

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
