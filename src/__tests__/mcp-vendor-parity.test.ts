// Drift guard: the MCP (packages/public-extensiondev-mcp) VENDORS byte copies of
// this package's origins/paths modules because it publishes standalone and
// cannot take a `workspace:*` dep (see the vendored files' headers). Nothing in
// CI can diff the two -- the MCP submodule is absent from the monorepo CI
// checkout, and the canonical package is absent from the MCP's own standalone
// CI -- so this guard runs where both DO coexist: a local monorepo working tree
// with the submodule checked out. It skips (does not fail) when the submodule
// is not present, and fails loudly on any body drift when it is.
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const canonicalDir = resolve(here, ".."); // packages/extensiondev-urls/src
const mcpLibDir = resolve(here, "../../../public-extensiondev-mcp/src/lib");

// Compare from the first `export` to EOF, so the differing vendor header comment
// is ignored and only the real module body is asserted identical.
function body(source: string): string {
  const match = source.match(/^export /m);
  if (!match || match.index === undefined) {
    throw new Error("no top-level export found");
  }
  return source.slice(match.index).trimEnd();
}

const CASES = [
  { canonical: "origins.ts", vendored: "urls-origins.ts" },
  { canonical: "paths.ts", vendored: "urls-paths.ts" },
] as const;

const submodulePresent = existsSync(resolve(mcpLibDir, "urls-origins.ts"));

describe("MCP vendored url modules stay byte-identical to @extensiondev/urls", () => {
  if (!submodulePresent) {
    it.skip("skipped: MCP submodule not checked out", () => {});
    return;
  }
  for (const c of CASES) {
    it(`${c.vendored} matches ${c.canonical}`, () => {
      const canonical = body(readFileSync(resolve(canonicalDir, c.canonical), "utf8"));
      const vendored = body(readFileSync(resolve(mcpLibDir, c.vendored), "utf8"));
      expect(
        vendored,
        `MCP ${c.vendored} drifted from ${c.canonical}; re-copy the body into packages/public-extensiondev-mcp/src/lib/${c.vendored}`,
      ).toBe(canonical);
    });
  }
});
