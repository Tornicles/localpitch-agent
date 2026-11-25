# Grana independence test evidence

Tests 01 through 45 were not run.

Blockers observed on this machine:

- `docker` is not a command.
- Docker Desktop is not installed in `C:\Program Files\Docker`.
- `OPENAI_API_KEY` is absent from the process environment.
- The agent checkout had no `node_modules` when the audit started.

Commands that exist and were not run: `pnpm sandbox:build`, `pnpm check`, `pnpm lint`, `pnpm test`, `pnpm test:integration`, `pnpm test:e2e`, `pnpm test:computer`, `pnpm test:computer-replay`, `pnpm test:compose-smoke`.

No outbound connection to OpenAI, E2B, Daytona, Cursor, or Rakazo was made by this pass. A dependency install may contact the package registry. That is not model or computer acceptance.

`pnpm install --frozen-lockfile` finished, then `pnpm --filter @rakazo/db generate`, then `pnpm exec vitest run packages/adapters/src/deployment-model.test.ts`. Result: 1 file, 8 tests, passed. That covers `OPENAI_API_KEY` with model `gpt-6-luna`. It does not start a computer or call OpenAI.
