# @extension.dev/urls

## 0.8.0

- Reserved the platform's own names as workspace slugs: `extension`,
  `extension-dev`, `extension-js`, `extension-land`, `extension-user-land`
  and the unhyphenated twin of each. A workspace owns
  `<slug>.extension.dev`, so these names read as the platform rather than as
  a tenant of it, and a minted slug can never be reclaimed.
- `extension-dev` is the one that could not wait. It is the workspace the
  curated template catalog is addressed under, so a stranger holding it would
  own the source half of every template address, permanently, from the moment
  the creation lane opens.

## 0.7.0

- Added `RESERVED_MINT_SLUGS`, the first path segments the console and code
  routing layers own under the `:workspace/:project` grammar, and refused them
  at mint time for both record kinds. A slug that escapes into a workspace or a
  project record becomes a URL people keep, so this set only ever grows and
  entries never leave it when a route is retired.
- Added `RESERVED_PROJECT_SLUGS` and `isReservedProjectSlug`. A project slug is
  the segment after the workspace on the console and the first path segment on
  the workspace's own userland host, so it shadows the same routing surface a
  workspace slug does. www held a local copy of this list; the copy is gone and
  both creation doors now read one home.
- `RESERVED_WORKSPACE_SLUGS` now contains the mint names, so `ai`, `builds`,
  `drafts`, `info`, `releases` and `s` can no longer be claimed as a workspace.

## 0.6.1

- Added `connect` to the reserved workspace slugs. www now serves
  `/connect/github`, the branded entry and landing for installing the
  extension.dev GitHub App, so no workspace may claim the address and
  answer for that page.

## 0.6.0

- Breaking: removed the `intelligence` origin. The app moved to
  code.extension.dev and the host has been verified there, so the transition
  0.5.0 staged is over. Callers reading `Origins.intelligence`,
  `PROD_ORIGINS.intelligence` or `DEV_LOCALHOST_ORIGINS.intelligence`, and
  callers passing `intelligence` to `resolveOrigins`, must use `code` instead.
  A caller left on the old key no longer compiles, which is the point.
- `intelligence` stays a reserved workspace slug. The retired hostname is still
  resolvable in the wild, so no workspace may claim it.

## 0.5.0

- Added the `code` origin (code.extension.dev), the app that hosts an anonymous
  prompt-first session at `/s/<id>` and the same project at
  `/<workspace>/<project>` once it graduates into a real repo.
- `intelligence` stays exactly as it was and keeps resolving. The two are
  deliberately live together for the length of the rename, so nothing has to
  cut over in one step. Removing `intelligence` is the later major.
- Added the `themes` origin (themes.extension.dev), which was a live app with no
  entry here, so every caller that wanted a themes URL had to spell one out by
  hand.
- `Origins` gained two required fields. Callers pass partial overrides to
  `resolveOrigins`, so this is additive for them, but code that builds a whole
  `Origins` object by hand has to name the new keys.

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
