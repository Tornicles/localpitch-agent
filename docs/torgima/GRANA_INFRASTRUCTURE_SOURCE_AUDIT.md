# Grana infrastructure source audit

Repository: `https://github.com/Tornicles/localpitch-agent` at `113cd44` (`main`). Working tree was clean before the OpenAI routing edit.

## Present

| Area | Path |
|---|---|
| Environment template | `.env.example` |
| Package scripts | `package.json` (`sandbox:build`, `check`, `test`, `test:computer`, `test:compose-smoke`) |
| Compose stack | `infra/compose/docker-compose.yml` — Postgres 18, migrate, API, worker, supervisor, computer image build |
| App image | `infra/compose/Dockerfile` |
| Computer image | `infra/sandboxes/computer/Dockerfile` — Debian bookworm, Chromium or Brave, Xvfb, Fluxbox, noVNC, Python, Bash, Git, GitHub CLI, Pandoc |
| Screen capture | `infra/sandboxes/computer/xcapture.c` |
| Browser helper | `infra/sandboxes/computer/rakazo-page-browser`, `rakazo-browser` |
| Control | `infra/sandboxes/computer/control.py`, `start.sh` |
| Supervisor | `infra/sandboxes/supervisor/` |
| Runtime packages | `packages/adapters`, `packages/core`, `packages/contracts`, `packages/db`, `packages/testkit` |
| Apps | `apps/api`, `apps/worker`, `apps/web`, `apps/desktop`, `apps/mobile` |
| Docs | `docs/self-host.md`, `docs/computer-runtime.md`, `README.md` |

## Missing on this machine

- Docker and a built `rakazo/computer:local` image digest.
- Installed `node_modules` at the start of the audit.
- A running API, worker, Postgres, or supervisor.
- An OpenAI credential.
- A separate `locksmith` repository checkout. Locksmith is inside localpitch.

## Baseline the source already selects

```ini
SANDBOX_PROVIDER=docker
CLOUD_AGENT_PROVIDER=none
AGENT_RUNTIME=pi
```

The example file previously set `PI_DEFAULT_PROVIDER=openrouter` and `PI_DEFAULT_MODEL=openai/gpt-6-luna`. The direct OpenAI catalog id in `packages/adapters/src/pi-models.ts` is `gpt-6-luna`. The example and `resolveDeploymentModel` now use that id with `OPENAI_API_KEY` when the provider is `openai`.
