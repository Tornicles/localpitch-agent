# Grana required API keys

No secret values are recorded here. Nothing in this list was purchased.

## Required to test the selected core profile

| Provider | Variable | File | Without it | Self-hosted substitute | Mandatory | Verified |
|---|---|---|---|---|---|---|
| OpenAI | `OPENAI_API_KEY` | `packages/adapters/src/deployment-model.ts`, Compose `OPENAI_API_KEY` | Model turns are not configured. They must fail closed | None for model intelligence. Execution stays on the Docker computer | Yes for the selected profile. Customers may use another approved provider or BYOK | No. The key is absent |

## Self-hosted, generated on the host

`POSTGRES_PASSWORD`, `POSTGRES_APP_PASSWORD`, `BETTER_AUTH_SECRET`, `ENCRYPTION_KEY` (64 hex characters), `SANDBOX_SUPERVISOR_TOKEN`, `SCREEN_PROXY_SECRET`. These are not vendor APIs.

## Optional, leave empty for the independence profile

`OPENROUTER_API_KEY`, `E2B_API_KEY`, `DAYTONA_API_KEY`, `BOAT_API_KEY`, `NOVITA_API_KEY`, `CREATEOS_SANDBOX_API_KEY`, `CURSOR_API_KEY`, `COMPOSIO_API_KEY`, `PIPEDREAM_CLIENT_ID`, `PIPEDREAM_CLIENT_SECRET`, `SUPERMEMORY_API_KEY`, `RAILWAY_API_TOKEN`.

## Torgima business functions, not core Grana

These live mainly in localpitch and stay off until the owner connects them: `RESEND_API_KEY` or `SMTP_URL`, `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`, `GOOGLE_PLACES_API_KEY`, Gmail and Microsoft mailbox client secrets, `TELEGRAM_BOT_TOKEN`. A queued send is not delivery. Places is a directory, not a substitute for the browser.

## Not a token the code can use yet

LiveKit, a live e-sign vendor, social publishing, and DNS registration have contracts in localpitch and no required key on the Docker Grana path.
