# Security Policy

## Supported versions

The latest published version on npm receives security fixes. Older versions
are not maintained; upgrade to the latest release before reporting.

## Reporting a vulnerability

Please report vulnerabilities privately, not through public issues or pull
requests.

- Preferred: open a private advisory through GitHub, under the repository's
  **Security** tab, using "Report a vulnerability".
- Alternatively, email boss@cezaraugusto.net.

Include the affected version, a description of the issue, and a minimal
reproduction if you have one. You will get an acknowledgement, and once a fix
is released we are happy to credit you unless you prefer to stay anonymous.

## Scope

This package builds URLs. It has no dependencies, performs no network or file
system access, and reads no environment variables of its own: every origin
override is passed in by the caller. Reports that are especially in scope:

- A caller-supplied override that escapes the resolver and yields an origin
  outside the intended host set, for example through a crafted hint that makes
  a production link resolve to an attacker-controlled host.
- A path builder that emits an unescaped segment, so a caller-supplied
  workspace, project, or template identifier can break out of the path it was
  meant to occupy.

Note by design: the resolver trusts its inputs. A caller that passes a hostile
origin gets that origin back, and that is the documented contract, not a
vulnerability. The same applies to path builders called with values the caller
already controls.
