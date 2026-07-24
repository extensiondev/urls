// @extensiondev/urls -- one source of truth for cross-app origins and paths.
//
// Two halves, imported together or via subpaths (`@extensiondev/urls/paths`,
// `@extensiondev/urls/origins`):
//   - paths:   pure, env-free route builders (the shape half of a link)
//   - origins: env-driven host resolver with local-dev derivation (the host half)
//
// A full link is `origins.<app> + <pathBuilder>(...)`.

export * from "./paths";
export * from "./origins";
