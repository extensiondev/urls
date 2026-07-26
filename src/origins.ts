// ██╗   ██╗██████╗ ██╗     ███████╗
// ██║   ██║██╔══██╗██║     ██╔════╝
// ██║   ██║██████╔╝██║     ███████╗
// ██║   ██║██╔══██╗██║     ╚════██║
// ╚██████╔╝██║  ██║███████╗███████║
//  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝
// Apache License 2.0 (c) 2026 Cezar Augusto and the extension.dev collaborators

export interface Origins {
  www: string;
  console: string;
  docs: string;
  inspect: string;
  preview: string;
  templates: string;
  themes: string;
  code: string;
  userland: string;
  registry: string;
  media: string;
}

export const PROD_ORIGINS: Origins = {
  www: "https://www.extension.dev",
  console: "https://console.extension.dev",
  docs: "https://docs.extension.dev",
  inspect: "https://inspect.extension.dev",
  preview: "https://preview.extension.dev",
  templates: "https://templates.extension.dev",
  themes: "https://themes.extension.dev",
  code: "https://code.extension.dev",
  userland: "https://extension.dev",
  registry: "https://registry.extension.land",
  media: "https://media.extension.land",
};

export const DEV_LOCALHOST_ORIGINS: Origins = {
  www: "http://localhost:3100",
  console: "http://console.extension.localhost",
  docs: "http://docs.extension.localhost",
  inspect: "http://inspect.extension.localhost",
  preview: "http://preview.extension.localhost",
  templates: "http://templates.extension.localhost",
  themes: "http://themes.extension.localhost",
  code: "http://code.extension.localhost",
  userland: "http://userland.extension.localhost",
  registry: "https://registry.extension.land",
  media: "https://media.extension.land",
};

function strip(value: string | undefined | null): string {
  return String(value ?? "").trim().replace(/\/+$/, "");
}

export function isLocalOrigin(url: string | undefined | null): boolean {
  const raw = strip(url);
  if (!raw) return false;
  let host: string;
  try {
    host = new URL(raw).hostname;
  } catch {
    return false;
  }
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host === "[::1]" ||
    host === "extension.localhost" ||
    host.endsWith(".extension.localhost")
  );
}

export function resolveOrigins(
  overrides: Partial<Origins> = {},
  opts: { hint?: string } = {},
): Origins {
  const devLike =
    isLocalOrigin(overrides.www) ||
    isLocalOrigin(overrides.console) ||
    isLocalOrigin(opts.hint);
  const base = devLike ? DEV_LOCALHOST_ORIGINS : PROD_ORIGINS;
  const pick = (key: keyof Origins): string => strip(overrides[key]) || base[key];
  return {
    www: pick("www"),
    console: pick("console"),
    docs: pick("docs"),
    inspect: pick("inspect"),
    preview: pick("preview"),
    templates: pick("templates"),
    themes: pick("themes"),
    code: pick("code"),
    userland: pick("userland"),
    registry: pick("registry"),
    media: pick("media"),
  };
}
