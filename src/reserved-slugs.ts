// ██╗   ██╗██████╗ ██╗     ███████╗
// ██║   ██║██╔══██╗██║     ██╔════╝
// ██║   ██║██████╔╝██║     ███████╗
// ██║   ██║██╔══██╗██║     ╚════██║
// ╚██████╔╝██║  ██║███████╗███████║
//  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝
// Apache License 2.0 (c) 2026 Cezar Augusto and the extension.dev collaborators

/* @invariant
 * One list, imported by both the server that refuses the name and the form
 * that greys it out.
 *
 * This used to be hand-copied into the console's workspace form, and the two
 * copies drifted: the server rejected names the form accepted, so someone
 * typing a valid-looking workspace name got a failure after submitting. It
 * lives in this package because it is the only one both the www server and the
 * console client already depend on.
 *
 * A name belongs here when it is a path www or the console serves, or a word
 * a visitor would reasonably type expecting something other than a workspace.
 * Every name routed as reserved in www's middleware must appear here, which
 * www's own spec asserts.
 */
export const RESERVED_WORKSPACE_SLUGS: ReadonlySet<string> = new Set([
  "about",
  "account",
  "admin",
  "api",
  "app",
  "assets",
  "auth",
  "blog",
  "bulk-delete",
  "careers",
  "changelog",
  "console",
  "contact",
  "cookies",
  "dashboard",
  "device",
  "docs",
  "favicon",
  "founders-note",
  "github",
  "hello",
  "help",
  "import",
  "internal",
  "join",
  "legal",
  "locales",
  "login",
  "logout",
  "mocks",
  "new",
  "people",
  "pricing",
  "privacy",
  "roadmap",
  "robots",
  "security",
  "settings",
  "shares",
  "signin",
  "signup",
  "sitemap",
  "status",
  "subscribe",
  "support",
  "templates",
  "terms",
  "www",
]);

export function isReservedWorkspaceSlug(slug: string): boolean {
  return RESERVED_WORKSPACE_SLUGS.has(String(slug || "").trim().toLowerCase());
}
