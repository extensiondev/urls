import { describe, expect, it } from "vitest";
import {
  ConsoleProjectPage,
  consoleProjectPath,
  consoleWorkspacePath,
  inspectTabPath,
  templateTabPath,
  wwwImportPath,
  wwwNewPath,
} from "../paths";
import {
  DEV_LOCALHOST_ORIGINS,
  PROD_ORIGINS,
  isLocalOrigin,
  resolveOrigins,
} from "../origins";

describe("paths", () => {
  it("builds console project pages from named tails", () => {
    const ref = { workspace: "acme", project: "widget" };
    expect(consoleProjectPath(ref)).toBe("/acme/widget");
    expect(consoleProjectPath(ref, ConsoleProjectPage.builds)).toBe("/acme/widget/builds");
    expect(consoleProjectPath(ref, ConsoleProjectPage.accessTokens)).toBe(
      "/acme/widget/settings/access-tokens",
    );
    expect(consoleProjectPath(ref, ConsoleProjectPage.build("abc123", "chrome"))).toBe(
      "/acme/widget/builds/abc123/chrome",
    );
    expect(consoleProjectPath(ref, ConsoleProjectPage.storesNew)).toBe(
      "/acme/widget/stores/new",
    );
  });

  it("encodes slug segments", () => {
    expect(consoleWorkspacePath("a b")).toBe("/a%20b");
    expect(templateTabPath("with space", "source")).toBe("/with%20space/source");
  });

  it("mirrors tab routers (default tab has no segment)", () => {
    expect(templateTabPath("react")).toBe("/react");
    expect(templateTabPath("react", "instructions")).toBe("/react/instructions");
    expect(inspectTabPath()).toBe("/");
    expect(inspectTabPath("trace")).toBe("/trace");
  });

  it("preserves the www creation deep-link contract", () => {
    expect(wwwNewPath({ template: "react" })).toBe("/new?template=react");
    expect(wwwImportPath({ template: "react", private: true })).toBe(
      "/import?template=react&private=true",
    );
    // empty / nullish params are dropped, not rendered as blanks
    expect(wwwNewPath({ template: "react", repo: "" })).toBe("/new?template=react");
  });
});

describe("origins", () => {
  it("defaults to prod with no overrides", () => {
    expect(resolveOrigins()).toEqual(PROD_ORIGINS);
  });

  it("derives the Caddy dev map when the base is local", () => {
    const origins = resolveOrigins({ www: "http://localhost:3100" });
    expect(origins.console).toBe("http://console.extension.localhost");
    expect(origins.inspect).toBe("http://inspect.extension.localhost");
    // registry/media have no local proxy, so they stay prod even in dev
    expect(origins.registry).toBe(DEV_LOCALHOST_ORIGINS.registry);
  });

  it("derives dev from a hint even when no origin override is local", () => {
    const origins = resolveOrigins(
      { console: undefined },
      { hint: "http://console.extension.localhost" },
    );
    expect(origins.console).toBe("http://console.extension.localhost");
  });

  it("lets an explicit override win over derivation", () => {
    const origins = resolveOrigins({
      www: "http://localhost:3100",
      console: "http://console.extension.localhost:9999",
    });
    expect(origins.console).toBe("http://console.extension.localhost:9999");
  });

  it("classifies hosts, refusing to treat *.localhost as local (public-suffix trap)", () => {
    expect(isLocalOrigin("http://localhost:3100")).toBe(true);
    expect(isLocalOrigin("http://console.extension.localhost")).toBe(true);
    expect(isLocalOrigin("https://console.extension.dev")).toBe(false);
    expect(isLocalOrigin("not a url")).toBe(false);
    expect(isLocalOrigin(undefined)).toBe(false);
  });
});
