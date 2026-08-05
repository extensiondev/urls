// ██╗   ██╗██████╗ ██╗     ███████╗
// ██║   ██║██╔══██╗██║     ██╔════╝
// ██║   ██║██████╔╝██║     ███████╗
// ██║   ██║██╔══██╗██║     ╚════██║
// ╚██████╔╝██║  ██║███████╗███████║
//  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝
// Apache License 2.0 (c) 2026 Cezar Augusto and the extension.dev collaborators

import { isLocalOrigin, PROD_ORIGINS } from "./origins.js";
import { withQuery, type ProjectRef, type QueryValue } from "./paths.js";

const seg = (value: string): string => encodeURIComponent(String(value));

export type UserlandHostMode = "subdomain" | "path";

export const USERLAND_BUILD_TABS = ["preview", "whats-new", "usage"] as const;
export type UserlandBuildTab = (typeof USERLAND_BUILD_TABS)[number];

export function isUserlandBuildTab(value: string): value is UserlandBuildTab {
  return (USERLAND_BUILD_TABS as readonly string[]).includes(value);
}

export const UserlandDialog = {
  run: "run",
  integrity: "integrity",
} as const;
export type UserlandDialogName = (typeof UserlandDialog)[keyof typeof UserlandDialog];

const DNS_LABEL = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

function strip(value: string | undefined | null): string {
  return String(value ?? "").trim().replace(/\/+$/, "");
}

export function userlandHostMode(base?: string): UserlandHostMode {
  return isLocalOrigin(strip(base) || PROD_ORIGINS.userland) ? "path" : "subdomain";
}

export interface UserlandLinkOptions {
  base?: string;
}

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

export const UserlandProjectPage = {
  overview: "",
  build: (buildId: string): string => `builds/${seg(buildId)}`,
  buildTab: (buildId: string, tab: UserlandBuildTab = "preview"): string =>
    tab === "preview" ? `builds/${seg(buildId)}` : `builds/${seg(buildId)}/${tab}`,
  browserBuild: (buildId: string, browser: string): string =>
    `builds/${seg(buildId)}/${seg(browser)}`,
  channel: (channel: string): string => `channels/${seg(channel)}`,
  channelShortcut: (channel: string): string => seg(channel),
  channelBrowser: (browser: string, channel: string): string =>
    `channels/${seg(browser)}/${seg(channel)}`,
  version: (version: string): string => `versions/${seg(version)}`,
  versionBrowser: (browser: string, version: string): string =>
    `versions/${seg(browser)}/${seg(version)}`,
} as const;

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
  query?: Record<string, QueryValue>;
}

export function userlandUrl(
  ref: ProjectRef,
  page = "",
  options: UserlandUrlOptions = {},
): string {
  const origin = userlandOrigin(ref.workspace, options);
  const path = userlandProjectPath(ref, page, options);
  return `${origin}${withQuery(path, options.query)}`;
}

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

export function userlandRunUrl(
  scope: ProjectRef,
  sha: string,
  browser: string,
  options: UserlandUrlOptions = {},
): string {
  return userlandDialogUrl(scope, sha, browser, UserlandDialog.run, options);
}
