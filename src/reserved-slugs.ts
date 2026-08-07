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
 * A name belongs here when it is a path www or the console serves, when it is
 * the hostname of an app in the fleet, since a workspace owns
 * <workspace>.extension.dev and would otherwise squat a live host, or when it
 * is a word a visitor would reasonably type expecting something other than a
 * workspace. Every name routed as reserved in www's middleware must appear
 * here, which www's own spec asserts, and every app hostname must appear here,
 * which this package's own spec asserts.
 *
 * A name never leaves this list when its app is renamed or retired. The old
 * hostname stays resolvable in the wild long after it stops being an `Origins`
 * key, so handing it to a workspace would let that workspace answer for the
 * retired host. `intelligence` is here for exactly that reason: it became
 * `code` and is no longer an origin, and this package's own spec asserts it
 * stays refused.
 *
 * A name also belongs here when it is a top-level prefix the registry bucket
 * already owns. `production`, `development`, `test` and `preview` are what
 * `deployEnvironment()` stamps on every platform object-store key, and the
 * registry Worker refuses those prefixes outright, so a workspace holding one
 * of those slugs would get 401 on its own public build artifacts. `preview`
 * was already here as a hostname; the other three are here so the Worker's
 * deny can never be pointed at a customer.
 */
/* @invariant
 * The mint list is the irreversible half of this file and it only ever grows.
 *
 * A slug that escapes into a workspace or project record becomes a URL people
 * keep, so a name the fork and creation unification needs later cannot be
 * reclaimed from a customer once minted. This set is every first segment the
 * code and console routing layers own or will own under the unified
 * :ws/:proj grammar, and both of www's creation doors refuse it at mint time
 * for BOTH record kinds. Entries never leave; retiring a route does not free
 * its name, for the same reason `intelligence` stays below.
 */
export const RESERVED_MINT_SLUGS: ReadonlySet<string> = new Set([
  "ai",
  "api",
  "assets",
  "builds",
  "bulk-delete",
  "code",
  "drafts",
  "founders-note",
  "hello",
  "import",
  "info",
  "new",
  "releases",
  "s",
  "settings",
  "shares",
  "templates",
]);

/* @invariant
 * THE PLATFORM'S OWN NAMES ARE NOT AVAILABLE TO A STRANGER.
 *
 * A workspace owns `<slug>.extension.dev`, and these names read as the
 * platform rather than as a tenant of it. `extension-dev` is the workspace the
 * curated template catalog is addressed under, so a stranger holding it owns
 * the source half of every template address; `extensiondev`, `extension-js`
 * and `extension-user-land` are GitHub organizations this platform operates,
 * including the one every customer mirror repository lives in; `extension` is
 * the name the CLI publishes under. Each is listed with its unhyphenated twin
 * because a squatter reaching for one reaches for the other, and a name here
 * costs nothing while a name minted is gone for good.
 *
 * None of these can be lost to the personal-workspace lane either: that lane
 * mints a workspace named after a GitHub login, and every name below is an
 * organization, which cannot sign in.
 */
const PLATFORM_IDENTITY_SLUGS: readonly string[] = [
  "extension",
  "extension-dev",
  "extension-js",
  "extension-land",
  "extension-user-land",
  "extensiondev",
  "extensionjs",
  "extensionland",
  "extensionuserland",
];

export const RESERVED_WORKSPACE_SLUGS: ReadonlySet<string> = new Set([
  ...RESERVED_MINT_SLUGS,
  ...PLATFORM_IDENTITY_SLUGS,
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
  "code",
  "connect",
  "console",
  "contact",
  "cookies",
  "dashboard",
  "development",
  "device",
  "docs",
  "favicon",
  "founders-note",
  "github",
  "hello",
  "help",
  "import",
  "inspect",
  "intelligence",
  "internal",
  "join",
  "legal",
  "locales",
  "login",
  "logout",
  "media",
  "mocks",
  "new",
  "people",
  "preview",
  "pricing",
  "privacy",
  "production",
  "registry",
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
  "test",
  "themes",
  "userland",
  "www",
]);

export function isReservedWorkspaceSlug(slug: string): boolean {
  return RESERVED_WORKSPACE_SLUGS.has(String(slug || "").trim().toLowerCase());
}

/* @invariant
 * A project slug is the segment after the workspace on the console and the
 * FIRST path segment on the workspace's own userland host, so it shadows the
 * same routing surface a workspace slug does plus the project pages the
 * console serves beside it. `mocks` is carried over from the list www grew
 * locally before this file became the one home; it stays for the same
 * no-entry-ever-leaves rule as everything else.
 */
export const RESERVED_PROJECT_SLUGS: ReadonlySet<string> = new Set([
  ...RESERVED_MINT_SLUGS,
  "mocks",
]);

export function isReservedProjectSlug(slug: string): boolean {
  return RESERVED_PROJECT_SLUGS.has(String(slug || "").trim().toLowerCase());
}
