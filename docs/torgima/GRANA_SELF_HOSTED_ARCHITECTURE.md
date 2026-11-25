# Grana self-hosted architecture

Torgima owns accounts, CRM, Studio, documents, billing, communications, calendar, client experience, and administration in localpitch. Grana owns planning, model routing, tools, computer, browser, terminal, and files. Locksmith owns vaults and grants. The model provider supplies inference only.

## Services in Compose

- `postgres` — Postgres 18. Owner login migrates. `rakazo_app` is the runtime login and is subject to row-level security.
- `migrate` — one-shot schema apply. The only service with the owner database URL.
- `api` — assistant HTTP API on the app image.
- `worker` — Graphile Worker. Same app image, no owner database URL.
- `supervisor` — creates computers. It alone mounts `/var/run/docker.sock`.
- `computer` — builds `rakazo/computer:local` and exits. Live computers are started later by the supervisor.
- `data-init` — fixes ownership of `/data`.

The API and worker do not receive the Docker socket. Agent-authored code runs inside the computer container, not on the supervisor.

## Trust boundaries

The supervisor socket is host-level power. It is authenticated with `SANDBOX_SUPERVISOR_TOKEN` and is not a public product port in the base file. That is not a proof that every untrusted customer workload is isolated. The inherited computer notes say Team Computer bots can share an OS user, browser profile, and shell. A shared computer is a capacity choice, not a client boundary. Sensitive work needs its own computer.

`SANDBOX_COMPUTER_EGRESS` defaults to `auto` in Compose and is documented as `restricted` once `restrict-computer-egress.sh` has been applied. Docker Desktop on Windows cannot apply those rules. This machine has no Docker, so egress was not tested.

## What does not belong on Vercel

Persistent Docker computers cannot run inside a Vercel function. The localpitch web app can stay separate. Grana’s API, worker, database, and computers need a host that can run containers. No host was provisioned in this pass.
