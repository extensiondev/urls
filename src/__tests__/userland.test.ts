import { describe, expect, it } from "vitest";
import { DEV_LOCALHOST_ORIGINS, PROD_ORIGINS, resolveOrigins } from "../origins";
import {
  UserlandDialog,
  UserlandProjectPage,
  userlandBuildUrl,
  userlandChannelFileUrl,
  userlandChannelUrl,
  userlandDialogUrl,
  userlandHostMode,
  userlandOrigin,
  userlandProjectPath,
  userlandRunUrl,
  userlandUrl,
} from "../userland";

const ref = { workspace: "acme", project: "widget" };
const DEV = { base: DEV_LOCALHOST_ORIGINS.userland };

describe("userland host mode", () => {
  it("puts the workspace in the subdomain on prod and the path in dev", () => {
    expect(userlandHostMode()).toBe("subdomain");
    expect(userlandHostMode(PROD_ORIGINS.userland)).toBe("subdomain");
    expect(userlandHostMode(DEV_LOCALHOST_ORIGINS.userland)).toBe("path");
    expect(userlandHostMode("http://localhost:3101")).toBe("path");
  });

  it("derives the prod origin by prefixing the workspace onto the apex", () => {
    expect(userlandOrigin("acme")).toBe("https://acme.extension.dev");
    expect(userlandOrigin("ACME")).toBe("https://acme.extension.dev");
  });

  it("leaves the dev origin alone because the workspace moves into the path", () => {
    expect(userlandOrigin("acme", DEV)).toBe("http://userland.extension.localhost");
    expect(userlandOrigin("acme", { base: "http://localhost:3101" })).toBe(
      "http://localhost:3101",
    );
  });

  it("refuses to build a host from a slug that is not a DNS label", () => {
    expect(() => userlandOrigin("not a slug")).toThrow(/subdomain label/);
    expect(() => userlandOrigin("-leading")).toThrow();
    expect(() => userlandOrigin("")).toThrow();
    expect(() => userlandOrigin("not a slug", DEV)).not.toThrow();
  });
});

describe("userland paths", () => {
  it("drops the workspace from the path in subdomain mode and keeps it in dev", () => {
    expect(userlandProjectPath(ref)).toBe("/widget");
    expect(userlandProjectPath(ref, "", DEV)).toBe("/acme/widget");
  });

  it("mirrors the app's route table", () => {
    expect(userlandProjectPath(ref, UserlandProjectPage.build("abc1234"))).toBe(
      "/widget/builds/abc1234",
    );
    expect(
      userlandProjectPath(ref, UserlandProjectPage.browserBuild("abc1234", "chrome")),
    ).toBe("/widget/builds/abc1234/chrome");
    expect(userlandProjectPath(ref, UserlandProjectPage.channel("stable"))).toBe(
      "/widget/stable",
    );
    expect(
      userlandProjectPath(ref, UserlandProjectPage.channelBrowser("firefox", "beta"), DEV),
    ).toBe("/acme/widget/beta/firefox");
  });

  it("names exactly the pages the app serves", () => {
    expect(Object.keys(UserlandProjectPage).sort()).toEqual(
      ["browserBuild", "build", "channel", "channelBrowser", "overview"].sort(),
    );
  });

  it("encodes segments", () => {
    expect(userlandProjectPath({ workspace: "acme", project: "a b" })).toBe("/a%20b");
  });
});

describe("userland urls", () => {
  it("builds the share URL shape /api/cli/publish hands back", () => {
    expect(
      userlandBuildUrl(ref, "abc1234", { query: { share: "tok" } }),
    ).toBe("https://acme.extension.dev/widget/builds/abc1234?share=tok");
    expect(userlandUrl(ref)).toBe("https://acme.extension.dev/widget");
  });

  it("scopes a build URL to one browser when asked", () => {
    expect(userlandBuildUrl(ref, "abc1234", { browser: "chrome" })).toBe(
      "https://acme.extension.dev/widget/builds/abc1234/chrome",
    );
  });

  it("builds the PR-comment dialog deep links", () => {
    expect(userlandDialogUrl(ref, "abc1234", "chrome", UserlandDialog.run)).toBe(
      "https://acme.extension.dev/widget/builds/abc1234/chrome?dialog=run",
    );
    expect(
      userlandDialogUrl(ref, "abc1234", "firefox", UserlandDialog.integrity, {
        query: { share: "tok" },
      }),
    ).toBe(
      "https://acme.extension.dev/widget/builds/abc1234/firefox?share=tok&dialog=integrity",
    );
  });

  it("builds the run-in-browser launcher URL the console launcher links to", () => {
    expect(userlandRunUrl(ref, "abc1234", "chrome")).toBe(
      "https://acme.extension.dev/widget/builds/abc1234/chrome?dialog=run",
    );
    expect(userlandRunUrl(ref, "abc1234", "chrome")).toBe(
      userlandDialogUrl(ref, "abc1234", "chrome", UserlandDialog.run),
    );
  });

  it("builds channel URLs, browser-scoped or not", () => {
    expect(userlandChannelUrl(ref, "preview")).toBe(
      "https://acme.extension.dev/widget/preview",
    );
    expect(userlandChannelUrl(ref, "preview", { browser: "chrome" })).toBe(
      "https://acme.extension.dev/widget/preview/chrome",
    );
  });

  it("keeps a channel's files under channels/, apart from its page", () => {
    expect(userlandChannelFileUrl(ref, "stable", "updates.json")).toBe(
      "https://acme.extension.dev/widget/channels/stable/updates.json",
    );
  });

  it("follows a local stack end to end through resolveOrigins", () => {
    const origins = resolveOrigins({ www: "http://localhost:3100" });
    expect(origins.userland).toBe("http://userland.extension.localhost");
    expect(userlandBuildUrl(ref, "abc1234", { base: origins.userland })).toBe(
      "http://userland.extension.localhost/acme/widget/builds/abc1234",
    );
  });
});
