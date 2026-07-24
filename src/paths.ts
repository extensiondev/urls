// ██╗   ██╗██████╗ ██╗     ███████╗
// ██║   ██║██╔══██╗██║     ██╔════╝
// ██║   ██║██████╔╝██║     ███████╗
// ██║   ██║██╔══██╗██║     ╚════██║
// ╚██████╔╝██║  ██║███████╗███████║
//  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝
// Apache License 2.0 (c) 2026 Cezar Augusto and the extension.dev collaborators

export interface ProjectRef {
  workspace: string;
  project: string;
}

const seg = (value: string): string => encodeURIComponent(String(value));

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
  stores: "stores",
  storesNew: "stores/new",
  store: (store: string): string => `stores/${seg(store)}`,
  storeSubmissions: (store: string): string => `stores/${seg(store)}/submissions`,
  storeSubmissionNew: (store: string): string => `stores/${seg(store)}/submissions/new`,
  storeSubmission: (store: string, submissionId: string): string =>
    `stores/${seg(store)}/submissions/${seg(submissionId)}`,
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
