import { describe, expect, it } from "vitest";

import { PROD_ORIGINS } from "../origins";
import {
  RESERVED_WORKSPACE_SLUGS,
  isReservedWorkspaceSlug,
} from "../reserved-slugs";

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
