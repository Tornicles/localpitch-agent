# Grana self-hosted deployment runbook

This runbook was not executed. Docker is not installed here, and no OpenAI key is configured.

## Host

A machine with Docker, Node 22, and pnpm 9.15.0. Windows Docker Desktop cannot apply the restricted-egress script. A Linux Docker host is the production-shaped target. Do not buy a server without owner approval.

## Configure

1. Copy `.env.independence.example` to `.env`.
2. Generate the passwords and the four long secrets. Put the OpenAI key only in `.env`.
3. Leave E2B, Daytona, Boat, Novita, CreateOS, Cursor, Composio, Pipedream, and Supermemory empty.
4. Set `PI_DEFAULT_PROVIDER=openai` and `PI_DEFAULT_MODEL=gpt-6-luna`.

## Start

From the agent checkout:

```bash
pnpm sandbox:build
pnpm compose:up
```

`compose:down` in `package.json` uses `down -v`, which deletes the database volume. Do not run it against a database that holds work.

## Health

Do not treat a present variable as health. Check Postgres `pg_isready`, the API process, the worker process, and the supervisor listening on its private port. A computer is healthy only after the supervisor starts a container from `rakazo/computer:local`.

## Stop

Stop the Compose project without deleting volumes unless the data is disposable. Customer files live under the data directory and Postgres.
