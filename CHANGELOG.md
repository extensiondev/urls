# @extension.dev/urls

## 0.2.0

- First public release. Renamed from the private `@extensiondev/urls` to the
  published `@extension.dev/urls`, matching the fleet's public-package scope.
- Added the `preview` origin (preview.extension.dev, the author's in-progress
  build door) and a `previewSharePath(previewId)` builder for the shareable
  `/?preview=<id>` render URL.
- Ships a compiled `dist` (rslib, cjs + types) for standalone npm consumers such
  as the public MCP, which previously vendored byte copies of these modules.
