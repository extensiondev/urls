import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (name: string): string =>
  readFileSync(new URL(`../../${name}`, import.meta.url), "utf8");

describe("README", () => {
  it("documents every entry point the manifest exports", () => {
    const manifest = JSON.parse(read("package.json"));
    const readme = read("README.md");
    for (const subpath of Object.keys(manifest.exports)) {
      if (subpath === ".") continue;
      expect(readme, subpath).toContain(`\`${manifest.name}${subpath.slice(1)}\``);
    }
  });
});
