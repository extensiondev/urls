// userland.extension.dev -- the PUBLIC build viewer, and the one app in the
// fleet whose URL shape does not fit the flat `Origins` map, which is why it
// lives in its own module instead of alongside the others in ./paths.
//
// Two things make it different:
//
//   1. The production host is PER-WORKSPACE. A build page is served from
//      `<workspace>.extension.dev`, so the workspace slug is part of the HOST,
//      not the path. `Origins.userland` therefore holds the apex
//      (`https://extension.dev`) and `userlandOrigin(workspace)` derives the
//      real origin. Never concatenate the base yourself.
//   2. Local dev serves every workspace from ONE host
//      (`userland.extension.localhost`), so there the workspace moves back into
//      the path. That flips the whole route table shape, which is why every
//      builder here takes the resolved base and derives the mode from it rather
//      than accepting a boolean a caller might get backwards.
//
// This mirrors apps/userland.extension.dev/src/app/{paths,route-context}.ts.
// That app consumes these builders, so a route rename there is a one-line
// change here instead of a silent drift in every link the platform hands out.
// The link most at risk is the share URL `POST /api/cli/publish` returns, which
// is what `extension_publish` gives an agent to pass to a human.

import { isLocalOrigin, PROD_ORIGINS } from "./origins";
import { withQuery, type ProjectRef, type QueryValue } from "./paths";

const seg = (value: string): string => encodeURIComponent(String(value));

/**
 * Where the workspace slug lives in a userland URL. `subdomain` is production
 * (`<workspace>.extension.dev/<project>`), `path` is local dev
 * (`userland.extension.localhost/<workspace>/<project>`).
 */
export type UserlandHostMode = "subdomain" | "path";

/**
 * Tabs on the build overview page. `preview` is the default and lives at the
 * bare build path. These names are RESERVED: they occupy the same URL slot as
 * `/builds/:buildId/:browser`, and the static routes win over the dynamic
 * browser segment, so a browser may never be named one of these.
 */
export const USERLAND_BUILD_TABS = ["preview", "whats-new", "usage"] as const;
export type UserlandBuildTab = (typeof USERLAND_BUILD_TABS)[number];

export function isUserlandBuildTab(value: string): value is UserlandBuildTab {
  return (USERLAND_BUILD_TABS as readonly string[]).includes(value);
}

/**
 * Dialogs the build page opens from a query param. These are the deep links
 * release PR comments and store-submission notes point at.
 */
export const UserlandDialog = {
  run: "run",
  integrity: "integrity",
} as const;
export type UserlandDialogName = (typeof UserlandDialog)[keyof typeof UserlandDialog];

// A DNS label: what a workspace slug must be to survive becoming a subdomain.
// Deliberately the same shape www's access-grant CORS check accepts, so a slug
// that can address userland is exactly a slug that can call back to www.
const DNS_LABEL = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

function strip(value: string | undefined | null): string {
  return String(value ?? "").trim().replace(/\/+$/, "");
}

/**
 * Which shape the given userland base serves. Local bases put the workspace in
 * the path; everything else puts it in the subdomain. Derived rather than
 * passed so a caller cannot get prod and dev backwards.
 */
export function userlandHostMode(base?: string): UserlandHostMode {
  return isLocalOrigin(strip(base) || PROD_ORIGINS.userland) ? "path" : "subdomain";
}

export interface UserlandLinkOptions {
  /**
   * The userland base, i.e. `resolveOrigins(...).userland`. In production this
   * is the APEX (`https://extension.dev`) and the workspace becomes a
   * subdomain of it; in dev it is the single local host. Defaults to prod.
   */
  base?: string;
}

/**
 * The origin that serves this workspace's build pages.
 *
 * Production: `https://<workspace>.extension.dev`.
 * Local dev:  the base unchanged (the workspace moves into the path).
 *
 * Throws when the slug cannot be a DNS label in subdomain mode. That is a
 * programming error and emitting a wrong host silently is precisely the
 * failure this module exists to prevent, so it must not be papered over.
 */
export function userlandOrigin(
  workspace: string,
  options: UserlandLinkOptions = {},
): string {
  const base = strip(options.base) || PROD_ORIGINS.userland;
  if (userlandHostMode(base) === "path") return base;

  const slug = String(workspace ?? "").trim().toLowerCase();
  if (!DNS_LABEL.test(slug)) {
    throw new Error(
      `Workspace slug ${JSON.stringify(workspace)} cannot be a subdomain label; ` +
        "userland production hosts are <workspace>.extension.dev.",
    );
  }
  const url = new URL(base);
  url.hostname = `${slug}.${url.hostname}`;
  return strip(url.toString());
}

/**
 * Named page tails under a userland project. Values are the exact segments the
 * app's router serves; pass one to `userlandProjectPath` / `userlandUrl` rather
 * than hand-typing a path.
 */
export const UserlandProjectPage = {
  overview: "",
  build: (buildId: string): string => `builds/${seg(buildId)}`,
  buildTab: (buildId: string, tab: UserlandBuildTab = "preview"): string =>
    tab === "preview" ? `builds/${seg(buildId)}` : `builds/${seg(buildId)}/${tab}`,
  browserBuild: (buildId: string, browser: string): string =>
    `builds/${seg(buildId)}/${seg(browser)}`,
  channel: (channel: string): string => `channels/${seg(channel)}`,
  /**
   * `/:project/:channel` -- the bare channel shortcut the app also serves
   * (ChannelShortcutRoute). Shorter to paste than the `channels/` form, which
   * is why release PR comments use it. It shares its URL slot with nothing
   * else at that depth, but it does mean a channel may not be named `builds`,
   * `channels`, or `versions`.
   */
  channelShortcut: (channel: string): string => seg(channel),
  channelBrowser: (browser: string, channel: string): string =>
    `channels/${seg(browser)}/${seg(channel)}`,
  version: (version: string): string => `versions/${seg(version)}`,
  versionBrowser: (browser: string, version: string): string =>
    `versions/${seg(browser)}/${seg(version)}`,
} as const;

/**
 * The PATH half of a userland link. In subdomain mode the workspace is already
 * in the host so the path starts at the project; in path mode it is prefixed.
 */
export function userlandProjectPath(
  ref: ProjectRef,
  page = "",
  options: UserlandLinkOptions = {},
): string {
  const head =
    userlandHostMode(options.base) === "subdomain"
      ? `/${seg(ref.project)}`
      : `/${seg(ref.workspace)}/${seg(ref.project)}`;
  const tail = String(page ?? "").replace(/^\/+/, "");
  return tail ? `${head}/${tail}` : head;
}

export interface UserlandUrlOptions extends UserlandLinkOptions {
  /** Query params to append, e.g. `{ share: token }` or `{ dialog: "run" }`. */
  query?: Record<string, QueryValue>;
}

/**
 * A complete userland URL: the per-workspace origin joined to the page path.
 * This is the builder every cross-app caller wants (www's publish/share
 * endpoints, the MCP's release tools) because userland's two halves cannot be
 * chosen independently.
 */
export function userlandUrl(
  ref: ProjectRef,
  page = "",
  options: UserlandUrlOptions = {},
): string {
  const origin = userlandOrigin(ref.workspace, options);
  const path = userlandProjectPath(ref, page, options);
  return `${origin}${withQuery(path, options.query)}`;
}

/**
 * The canonical public page for one build. When `browser` is given this is the
 * per-browser page that carries the artifact downloads; without it, the
 * cross-browser overview.
 */
export function userlandBuildUrl(
  ref: ProjectRef,
  buildId: string,
  options: UserlandUrlOptions & { browser?: string } = {},
): string {
  const page = options.browser
    ? UserlandProjectPage.browserBuild(buildId, options.browser)
    : UserlandProjectPage.build(buildId);
  return userlandUrl(ref, page, options);
}

/**
 * A build link with a dialog already open. `run` is the run-locally
 * instructions, `integrity` is the artifact integrity report. Both are
 * browser-scoped because the dialogs describe one browser's artifact.
 */
export function userlandDialogUrl(
  ref: ProjectRef,
  buildId: string,
  browser: string,
  dialog: UserlandDialogName,
  options: UserlandUrlOptions = {},
): string {
  return userlandUrl(ref, UserlandProjectPage.browserBuild(buildId, browser), {
    ...options,
    query: { ...(options.query ?? {}), dialog },
  });
}

/**
 * The public page for whatever build currently holds a release channel.
 * `shortcut` picks the bare `/:project/:channel` form over `/channels/...`.
 */
export function userlandChannelUrl(
  ref: ProjectRef,
  channel: string,
  options: UserlandUrlOptions & { browser?: string; shortcut?: boolean } = {},
): string {
  const page = options.browser
    ? UserlandProjectPage.channelBrowser(options.browser, channel)
    : options.shortcut
      ? UserlandProjectPage.channelShortcut(channel)
      : UserlandProjectPage.channel(channel);
  return userlandUrl(ref, page, options);
}
