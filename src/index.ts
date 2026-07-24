// @extension.dev/urls -- one source of truth for cross-app origins and paths.
//
// Two halves, imported together or via subpaths (`@extension.dev/urls/paths`,
// `@extension.dev/urls/origins`):
//   - paths:   pure, env-free route builders (the shape half of a link)
//   - origins: env-driven host resolver with local-dev derivation (the host half)
//
// A full link is `origins.<app> + <pathBuilder>(...)`.
//
// userland is the exception and gets its own module (`@extension.dev/urls/userland`):
// its production host is per-workspace, so the two halves cannot be chosen
// independently and it exposes whole-URL builders instead.

export * from "./paths";
export * from "./origins";
export * from "./userland";
