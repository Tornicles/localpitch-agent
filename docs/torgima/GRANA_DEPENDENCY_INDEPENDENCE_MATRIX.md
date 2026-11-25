# Grana dependency independence matrix

Classification is from source at `113cd44` plus the OpenAI routing edit. Absence of a key does not remove the adapter.

| Dependency | Class | Default | Core startup if absent |
|---|---|---|---|
| Node 22, pnpm, TypeScript, Pi (`@earendil-works/pi-ai`) | Required open-source runtime | installed by the repo | Fails |
| PostgreSQL 18 | Required Torgima-operated infrastructure | Compose service | Fails |
| Docker computer + supervisor | **Optional** computer backend | Implicit default falls to `none` if Docker daemon unreachable; explicit `SANDBOX_PROVIDER=docker` still requests Docker | Computer/Category F unavailable; **API/worker boot must not require Docker** |
| `OPENAI_API_KEY` with `PI_DEFAULT_PROVIDER=openai` | Required selected model connection for the chosen profile | example now selects it | Model turns fail closed. No paid fallback was added |
| OpenRouter, Anthropic, Gemini, xAI, Groq, and the other Pi keys | Optional model provider | empty | Not required when OpenAI or BYOK is configured |
| E2B, Daytona, Boat, Novita, CreateOS, Railway sandbox | Optional external managed service | keys empty | Must not be required. Compose default is Docker |
| Cursor Cloud Agent | Optional external managed service | `CLOUD_AGENT_PROVIDER=none` | Not required |
| Composio, Pipedream, integrations.sh | Optional customer connector catalog | keys empty | Not required. MCP and OpenAPI remain the direct path |
| Supermemory | Optional external memory | key empty | Core memory stays in Postgres |
| Resend, SMTP, Slack, Telegram, WhatsApp, Sendblue | Optional customer-connected provider | empty | Messaging stays off |
| Stripe | Optional billing | unset means billing off | Not required to run Grana |
| Infisical, AWS KMS | Optional secret storage | `SECRET_STORE=encrypted`, `MASTER_KEY_PROVIDER=local` | Local encryption is the default |
| Sentry, Axiom, PostHog | Optional telemetry | empty / `ANALYTICS_PROVIDER=none` | Off |
| Playwright, Vitest | Test-only | devDependencies | Not a production runtime |
| `ghcr.io/elie222/rakazo/app` | Unused for a source build when `RAKAZO_IMAGE_TAG=local` | tag `local` | A customer install must not pull an unreviewed upstream installer |
| Rakazo commercial API | Explicitly excluded as a requirement | no subscription setting in the Docker baseline | Core path does not call it |
