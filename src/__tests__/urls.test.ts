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
    expect(consoleProjectPath(ref, ConsoleProjectPage.submissionsNew)).toBe(
      "/acme/widget/submissions/new",
    );
  });

  it("builds the submissions pages under one root with no repeated segment", () => {
    const ref = { workspace: "acme", project: "widget" };
    expect(consoleProjectPath(ref, ConsoleProjectPage.submissions)).toBe(
      "/acme/widget/submissions",
    );
    expect(consoleProjectPath(ref, ConsoleProjectPage.submissionsStore("chrome"))).toBe(
      "/acme/widget/submissions/chrome",
    );
    expect(
      consoleProjectPath(ref, ConsoleProjectPage.submissionsStoreHistory("chrome")),
    ).toBe("/acme/widget/submissions/chrome/history");
    expect(consoleProjectPath(ref, ConsoleProjectPage.submissionNew("chrome"))).toBe(
      "/acme/widget/submissions/chrome/new",
    );
    expect(consoleProjectPath(ref, ConsoleProjectPage.submission("chrome", "sub 1"))).toBe(
      "/acme/widget/submissions/chrome/sub%201",
    );
  });

  it("keeps every store key as an alias that answers its submissions twin", () => {
    expect(ConsoleProjectPage.stores).toBe(ConsoleProjectPage.submissions);
    expect(ConsoleProjectPage.storesNew).toBe(ConsoleProjectPage.submissionsNew);
    expect(ConsoleProjectPage.store("edge")).toBe(
      ConsoleProjectPage.submissionsStore("edge"),
    );
    expect(ConsoleProjectPage.storeSubmissions("edge")).toBe(
      ConsoleProjectPage.submissionsStoreHistory("edge"),
    );
    expect(ConsoleProjectPage.storeSubmissionNew("edge")).toBe(
      ConsoleProjectPage.submissionNew("edge"),
    );
    expect(ConsoleProjectPage.storeSubmission("edge", "sub_1")).toBe(
      ConsoleProjectPage.submission("edge", "sub_1"),
    );
  });

  it("hands out no path that still starts at the retired stores segment", () => {
    const tails = [
      ConsoleProjectPage.stores,
      ConsoleProjectPage.storesNew,
      ConsoleProjectPage.store("chrome"),
      ConsoleProjectPage.storeSubmissions("chrome"),
      ConsoleProjectPage.storeSubmissionNew("chrome"),
      ConsoleProjectPage.storeSubmission("chrome", "sub_1"),
    ];
    expect(tails).toHaveLength(6);
    for (const tail of tails) {
      expect(tail.split("/")[0]).toBe("submissions");
      expect(tail).not.toContain("stores");
    }
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
    expect(origins.docs).toBe("http://docs.extension.localhost");
    expect(origins.inspect).toBe("http://inspect.extension.localhost");
    expect(origins.registry).toBe(DEV_LOCALHOST_ORIGINS.registry);
  });

  it("resolves the docs origin to the platform docs site in prod", () => {
    expect(resolveOrigins().docs).toBe("https://docs.extension.dev");
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
    expect(isLocalOrigin("http://foo.localhost")).toBe(false);
    expect(isLocalOrigin("https://console.extension.dev")).toBe(false);
    expect(isLocalOrigin("not a url")).toBe(false);
    expect(isLocalOrigin(undefined)).toBe(false);
  });
});
