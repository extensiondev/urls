import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { seg, strip } from "../internal";

const source = (name: string): string =>
  readFileSync(new URL(`../${name}`, import.meta.url), "utf8");

describe("internal helpers", () => {
  it("live once, in internal.ts, and the entry modules import them from there", () => {
    for (const name of ["origins.ts", "paths.ts", "userland.ts"]) {
      const text = source(name);
      expect(text, name).not.toMatch(/^function strip\(/m);
      expect(text, name).not.toMatch(/^const seg = /m);
      expect(text, name).toMatch(/from "\.\/internal\.js"/);
    }
  });

  it("encode a segment and strip trailing slashes", () => {
    expect(seg("a b/c")).toBe("a%20b%2Fc");
    expect(strip(" https://acme.extension.dev/// ")).toBe("https://acme.extension.dev");
    expect(strip(undefined)).toBe("");
  });
});
