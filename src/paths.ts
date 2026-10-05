// ██╗   ██╗██████╗ ██╗     ███████╗
// ██║   ██║██╔══██╗██║     ██╔════╝
// ██║   ██║██████╔╝██║     ███████╗
// ██║   ██║██╔══██╗██║     ╚════██║
// ╚██████╔╝██║  ██║███████╗███████║
//  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝
// Apache License 2.0 (c) 2026 Cezar Augusto and the extension.dev collaborators

import { seg } from "./internal.js";

export interface ProjectRef {
  workspace: string;
  project: string;
}

function join(base: string, sub?: string): string {
  if (!sub) return base;
  return `${base}/${sub.replace(/^\/+/, "")}`;
}


export function consoleWorkspacePath(workspace: string, page = ""): string {
  return join(`/${seg(workspace)}`, page);
}

export function consoleProjectPath(ref: ProjectRef, page = ""): string {
  return join(`/${seg(ref.workspace)}/${seg(ref.project)}`, page);
}

const submissionsStorePage = (store: string): string => `submissions/${seg(store)}`;

const submissionsStoreHistoryPage = (store: string): string =>
  `submissions/${seg(store)}/history`;

const submissionNewPage = (store: string): string => `submissions/${seg(store)}/new`;

const submissionPage = (store: string, submissionId: string): string =>
  `submissions/${seg(store)}/${seg(submissionId)}`;

/* @invariant
 * THE STORE KEYS ARE ALIASES, AND THEY ANSWER THE SUBMISSIONS PATHS.
 *
 * The console's project tab moved from `/stores` to `/submissions` because
 * the page is about the act, not the destination. `stores`, `storesNew`,
 * `store`, `storeSubmissions`, `storeSubmissionNew` and `storeSubmission`
 * stay so a caller written against them keeps compiling, and each returns
 * exactly what its `submissions*` twin returns, so no caller can hand out an
 * address the console only answers with a redirect. The inner `submissions`
 * segment is gone because the root already says it: one store's full list is
 * `history`, and `new` and `history` are static siblings of the submission
 * id, which a store never mints as either word.
 */
export const ConsoleProjectPage = {
  overview: "",
  onboard: "onboard",
  activity: "activity",
  builds: "builds",
  build: (buildId: string, browser?: string): string =>
    browser ? `builds/${seg(buildId)}/${seg(browser)}` : `builds/${seg(buildId)}`,
  releases: "releases",
  releasesNew: "releases/new",
  release: (releaseId: string): string => `releases/${seg(releaseId)}`,
  submissions: "submissions",
  submissionsNew: "submissions/new",
  submissionsStore: submissionsStorePage,
  submissionsStoreHistory: submissionsStoreHistoryPage,
  submissionNew: submissionNewPage,
  submission: submissionPage,
  stores: "submissions",
  storesNew: "submissions/new",
  store: submissionsStorePage,
  storeSubmissions: submissionsStoreHistoryPage,
  storeSubmissionNew: submissionNewPage,
  storeSubmission: submissionPage,
  projectSettings: "project-settings",
  projectSettingsSection: (section: string): string => `project-settings/${seg(section)}`,
  accessTokens: "settings/access-tokens",
} as const;


export type QueryValue = string | number | boolean | null | undefined;

export function withQuery(
  path: string,
  query?: Record<string, QueryValue>,
): string {
  if (!query) return path;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined || value === "") continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export function wwwNewPath(query?: Record<string, QueryValue>): string {
  return withQuery("/new", query);
}

export function wwwImportPath(query?: Record<string, QueryValue>): string {
  return withQuery("/import", query);
}

export function wwwDevicePath(): string {
  return "/device";
}

export function wwwTemplatesPath(slug?: string): string {
  return slug ? `/templates/${seg(slug)}` : "/templates";
}


export type TemplateTab = "preview" | "instructions" | "source";

export function templateTabPath(slug: string, tab: TemplateTab = "preview"): string {
  return tab === "preview" ? `/${seg(slug)}` : `/${seg(slug)}/${tab}`;
}


export type InspectTab = "preview" | "details" | "source" | "trace";

export function inspectTabPath(tab: InspectTab = "preview"): string {
  return tab === "preview" ? "/" : `/${tab}`;
}


export function previewSharePath(previewId: string): string {
  return `/?preview=${seg(previewId)}`;
}
