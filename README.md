[npm-version-image]: https://img.shields.io/npm/v/%40extension.dev%2Furls.svg?color=26FFB8
[npm-version-url]: https://www.npmjs.com/package/@extension.dev/urls
[npm-downloads-image]: https://img.shields.io/npm/dm/%40extension.dev%2Furls.svg?color=26FFB8
[npm-downloads-url]: https://www.npmjs.com/package/@extension.dev/urls
[action-image]: https://github.com/extensiondev/urls/actions/workflows/ci.yml/badge.svg?branch=main&color=26FFB8
[action-url]: https://github.com/extensiondev/urls/actions
[discord-image]: https://img.shields.io/discord/1253608412890271755?label=Discord&logo=discord&style=flat&color=26FFB8
[discord-url]: https://discord.gg/v9h2RgeTSN

# @extension.dev/urls [![Version][npm-version-image]][npm-version-url] [![Downloads][npm-downloads-image]][npm-downloads-url] [![CI][action-image]][action-url] [![Discord][discord-image]][discord-url]

> One source of truth for the origins and route paths that link the extension.dev fleet together.

<img alt="Logo" align="right" src="https://media.extension.land/brand/extension-dev/logo-dock.png" width="15.5%" />

```bash
npm install @extension.dev/urls
```

Powers cross-app links for www, console, docs, templates, themes, code, inspect, preview, userland, and the public MCP.

[extension.dev](https://extension.dev) · [Extension.js](https://extension.js.org) · [Discord](https://discord.gg/v9h2RgeTSN)

## Why one package for links

A cross-app link is two halves: the **host** (which app) and the **path** (which
route inside it). Hardcode either and the day an app moves or a route is renamed,
every caller drifts. This package keeps both halves in one place so a link a
tool hands back can never point at a route the app router no longer serves.

- **`@extension.dev/urls/paths`** - pure, environment-free route builders. Safe
  to call from any runtime (Next.js, Vite SPAs, Node, the bundled MCP) because
  they read no environment and only encode path shapes.
- **`@extension.dev/urls/origins`** - the host resolver. Each runtime names its
  env vars differently, so this module never reads the environment itself: the
  caller passes in whatever overrides it has and gets back a full origin set,
  with local-dev hosts derived from the Caddy proxy map when the environment
  looks local, and production hosts otherwise.
- **`@extension.dev/urls/userland`** - whole-URL builders for the public build
  viewer. userland is the one app whose production host is per-workspace
  (`<workspace>.extension.dev`), so its two halves cannot be chosen
  independently and it gets its own module rather than a `paths` entry.

## Usage

```ts
import { resolveOrigins } from "@extension.dev/urls/origins";
import { consoleProjectPath, ConsoleProjectPage } from "@extension.dev/urls/paths";

const origins = resolveOrigins({
  // Pass only the vars this runtime actually has; the rest derive.
  www: process.env.EXTENSION_DEV_API_URL,
});

// A full link is `origins.<app> + <pathBuilder>(...)`.
const buildsUrl =
  origins.console +
  consoleProjectPath({ workspace: "acme", project: "toolbar" }, ConsoleProjectPage.builds);
```

Set a single local override and every unset origin follows it to the dev proxy:

```ts
resolveOrigins({ www: "http://localhost:3100" }).console;
// -> "http://console.extension.localhost"
```

The public build viewer takes whole URLs, because the workspace lives in the
host in production and in the path locally:

```ts
import { userlandBuildUrl } from "@extension.dev/urls/userland";

userlandBuildUrl({ workspace: "acme", project: "toolbar" }, "abc1234");
// -> "https://acme.extension.dev/toolbar/builds/abc1234"

userlandBuildUrl({ workspace: "acme", project: "toolbar" }, "abc1234", {
  base: resolveOrigins({ www: "http://localhost:3100" }).userland,
});
// -> "http://userland.extension.localhost/acme/toolbar/builds/abc1234"
```

## The extension.dev stack

| Package | Use it to |
| --- | --- |
| [`@extension.dev/mcp`](https://www.npmjs.com/package/@extension.dev/mcp) | Give an AI agent hands: scaffold, run, inspect, and publish extensions |
| [`@extension.dev/skill`](https://www.npmjs.com/package/@extension.dev/skill) | Teach agents the judgment half: cross-browser rules, gotchas, playbooks |
| [`@extension.dev/deploy`](https://www.npmjs.com/package/@extension.dev/deploy) | Ship to the Chrome, Firefox, and Edge stores from CI or a terminal |
| [`@extension.dev/artifact-integrity`](https://www.npmjs.com/package/@extension.dev/artifact-integrity) | Verify artifacts and gate CI on tampered bytes before they ship |

All of it rides on [Extension.js](https://github.com/extension-js/extension.js), the open-source cross-browser extension framework.

## Community

- Join the [Discord](https://discord.gg/v9h2RgeTSN) for help and feedback
- Browse production-ready [examples](https://github.com/extension-js/examples)
- Report Extension.js framework issues on [GitHub](https://github.com/extension-js/extension.js/issues)

## License

Apache-2.0 (c) 2026 Cezar Augusto and the extension.dev collaborators. See [LICENSE](LICENSE).
