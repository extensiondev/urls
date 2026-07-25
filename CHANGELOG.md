# @extension.dev/urls

## 0.4.0

- Added the `docs` origin (docs.extension.dev, the platform documentation site),
  resolving to `http://docs.extension.localhost` in local dev like every other
  app behind the Caddy map.
- `Origins` gained a required field. Callers pass partial overrides to
  `resolveOrigins`, so this is additive for them, but code that builds a whole
  `Origins` object by hand has to name the new key.

## 0.3.0

- Added the `userland` origin and a new `@extension.dev/urls/userland` entry
  point covering the public build viewer: `userlandOrigin`,
  `userlandProjectPath`, `userlandUrl`, `userlandBuildUrl`,
  `userlandChannelUrl`, `userlandDialogUrl`, plus the `UserlandProjectPage`
  tails and the reserved `USERLAND_BUILD_TABS`.
- userland is the one app whose production host is per-workspace
  (`<workspace>.extension.dev`), so `Origins.userland` holds the apex and the
  module derives the real origin. In local dev the workspace moves into the
  path instead, and the mode is derived from the base rather than passed, so a
  caller cannot get prod and dev backwards.
- This closes the last hand-rolled cross-app link: the share URL
  `POST /api/cli/publish` returns (what `extension_publish` hands an agent to
  pass to a human) was concatenated from a local constant and could drift from
  the routes userland actually serves.

## 0.2.0

- First public release. Renamed from the private `@extensiondev/urls` to the
  published `@extension.dev/urls`, matching the fleet's public-package scope.
- Added the `preview` origin (preview.extension.dev, the author's in-progress
  build door) and a `previewSharePath(previewId)` builder for the shareable
  `/?preview=<id>` render URL.
- Ships a compiled `dist` (rslib, cjs + types) for standalone npm consumers such
  as the public MCP, which previously vendored byte copies of these modules.
