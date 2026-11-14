// ██╗   ██╗██████╗ ██╗     ███████╗
// ██║   ██║██╔══██╗██║     ██╔════╝
// ██║   ██║██████╔╝██║     ███████╗
// ██║   ██║██╔══██╗██║     ╚════██║
// ╚██████╔╝██║  ██║███████╗███████║
//  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝
// Apache License 2.0 (c) 2026 Cezar Augusto and the extension.dev collaborators

import net from "node:net";
import { afterEach } from "vitest";

/* @invariant NO TEST IN THIS PACKAGE REACHES A HOST, AND ONE THAT TRIES GOES
 * RED. The package builds addresses and never dials one, so nothing here has
 * a reason to open a connection: the global fetch and the socket connect every
 * other client ends at are both refused, and each refusal is remembered so
 * that the test which made the call fails even when its caller swallowed the
 * error. A unix socket path stays open, since that is how a process talks to
 * itself. The monorepo's suites carry the same rule in
 * scripts/lib/spec-network-guard.mjs; this file is its small form for a
 * repository that starts no server of its own.
 */
export const NETWORK_REFUSAL = "UNSTUBBED NETWORK CALL";

const refused: string[] = [];

function refuse(target: string): Error {
  const error = new Error(
    `${NETWORK_REFUSAL}: ${target}. A test in this package never reaches a host; stub the call.`,
  );

  refused.push(error.message);

  return error;
}

export function drainRefusedCalls(): string[] {
  return refused.splice(0, refused.length);
}

globalThis.fetch = ((input: RequestInfo | URL) => {
  const target = input instanceof Request ? input.url : String(input);

  return Promise.reject(refuse(`fetch ${target}`));
}) as typeof fetch;

const connect = net.Socket.prototype.connect;

net.Socket.prototype.connect = function guardedConnect(
  this: net.Socket,
  ...args: unknown[]
) {
  const first = Array.isArray(args[0]) ? args[0][0] : args[0];
  const options =
    first && typeof first === "object"
      ? (first as { path?: string; host?: string; port?: number })
      : null;

  if (options?.path || (typeof first === "string" && !/^\d+$/.test(first))) {
    return Reflect.apply(connect, this, args);
  }

  const host = options?.host ?? (typeof args[1] === "string" ? args[1] : "localhost");
  const port = options ? options.port : first;

  throw refuse(`socket ${host}:${String(port ?? "")}`);
} as typeof connect;

afterEach(() => {
  const seen = drainRefusedCalls();

  if (seen.length > 0) throw new Error(seen.join("\n"));
});
