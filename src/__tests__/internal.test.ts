import { readFileSync } from "node:fs";
import net from "node:net";
import { describe, expect, it } from "vitest";
import { seg, strip } from "../internal";
import { NETWORK_REFUSAL, drainRefusedCalls } from "./network-guard";

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

describe("the suite's network guard", () => {
  it("refuses a fetch and a socket to a host and remembers both for the test that made them", async () => {
    await expect(fetch("https://unstubbed.example.com/api")).rejects.toThrow(NETWORK_REFUSAL);
    expect(() => net.connect({ host: "unstubbed.example.com", port: 443 })).toThrow(NETWORK_REFUSAL);

    const seen = drainRefusedCalls();

    expect(seen).toHaveLength(2);
    expect(seen[0]).toContain("fetch https://unstubbed.example.com/api");
    expect(seen[1]).toContain("socket unstubbed.example.com:443");
    expect(drainRefusedCalls()).toEqual([]);
  });

  it("is installed before every test file by the vitest config", () => {
    expect(readFileSync(new URL("../../vitest.config.ts", import.meta.url), "utf8")).toContain(
      'setupFiles: ["./src/__tests__/network-guard.ts"]',
    );
  });
});
