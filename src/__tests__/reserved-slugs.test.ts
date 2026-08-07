import { describe, expect, it } from "vitest";

import { PROD_ORIGINS } from "../origins";
import {
  RESERVED_MINT_SLUGS,
  RESERVED_PROJECT_SLUGS,
  RESERVED_WORKSPACE_SLUGS,
  isReservedProjectSlug,
  isReservedWorkspaceSlug,
} from "../reserved-slugs";

const BOARD_MINT_LIST = [
  "ai",
  "code",
  "settings",
  "info",
  "drafts",
  "s",
  "api",
  "assets",
  "builds",
  "releases",
  "new",
  "import",
  "shares",
  "templates",
  "hello",
];

describe("isReservedWorkspaceSlug", () => {
  it("refuses a reserved name however it is typed", () => {
    for (const value of ["login", "LOGIN", "  Login  "]) {
      expect(isReservedWorkspaceSlug(value)).toBe(true);
    }
  });

  it("allows an ordinary workspace name", () => {
    for (const value of ["cezaraugusto", "seek-maro", "acme"]) {
      expect(isReservedWorkspaceSlug(value)).toBe(false);
    }
  });

  it("survives empty and junk input without throwing", () => {
    expect(isReservedWorkspaceSlug("")).toBe(false);
    expect(isReservedWorkspaceSlug(undefined as unknown as string)).toBe(false);
  });

  it("covers the console's own literal routes", () => {
    for (const route of [
      "bulk-delete",
      "founders-note",
      "hello",
      "import",
      "new",
      "shares",
      "templates",
    ]) {
      expect(RESERVED_WORKSPACE_SLUGS.has(route)).toBe(true);
    }
  });

  it("covers the www paths a workspace slug would shadow", () => {
    for (const route of ["connect", "device", "github", "join"]) {
      expect(RESERVED_WORKSPACE_SLUGS.has(route)).toBe(true);
    }
  });

  it("refuses as a workspace slug the hostname of every app in the fleet", () => {
    const squattable = Object.keys(PROD_ORIGINS).filter(
      (app) => !RESERVED_WORKSPACE_SLUGS.has(app),
    );
    expect(squattable).toEqual([]);
  });

  it("refuses every top-level prefix the registry bucket already owns", () => {
    for (const prefix of ["production", "preview", "development", "test"]) {
      expect(RESERVED_WORKSPACE_SLUGS.has(prefix)).toBe(true);
    }
  });

  it("keeps refusing fleet hostnames that no longer have an origins entry", () => {
    for (const host of ["intelligence"]) {
      expect(Object.keys(PROD_ORIGINS)).not.toContain(host);
      expect(RESERVED_WORKSPACE_SLUGS.has(host)).toBe(true);
    }
  });
});

describe("the mint list the board called irreversible", () => {
  it("names every slug the board reserved, one assertion per name", () => {
    for (const slug of BOARD_MINT_LIST) {
      expect(RESERVED_MINT_SLUGS.has(slug), slug).toBe(true);
    }
  });

  it("reaches both record kinds, so neither creation door can mint one", () => {
    for (const slug of BOARD_MINT_LIST) {
      expect(RESERVED_WORKSPACE_SLUGS.has(slug), slug).toBe(true);
      expect(RESERVED_PROJECT_SLUGS.has(slug), slug).toBe(true);
      expect(isReservedWorkspaceSlug(slug), slug).toBe(true);
      expect(isReservedProjectSlug(slug), slug).toBe(true);
    }
  });

  it("goes red when the list is emptied or shrunk", () => {
    expect(RESERVED_MINT_SLUGS.size).toBeGreaterThanOrEqual(
      BOARD_MINT_LIST.length,
    );
    expect(RESERVED_PROJECT_SLUGS.size).toBeGreaterThan(
      RESERVED_MINT_SLUGS.size - 1,
    );
  });

  it("keeps the project reservations www grew before this file was the home", () => {
    for (const slug of ["settings", "api", "assets", "mocks"]) {
      expect(isReservedProjectSlug(slug), slug).toBe(true);
    }
  });

  it("refuses a reserved project slug however it is typed", () => {
    for (const value of ["drafts", "DRAFTS", "  Drafts  "]) {
      expect(isReservedProjectSlug(value)).toBe(true);
    }
    expect(isReservedProjectSlug("my-extension")).toBe(false);
    expect(isReservedProjectSlug("")).toBe(false);
  });
});
