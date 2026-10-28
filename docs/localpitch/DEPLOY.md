<!-- Modified by LocalPitch, 2026 -->

# Deploy the LocalPitch assistant server

This fork stays named Rakazo in code, license, and the interface. LocalPitch's assistant is Grana. The server is the conversation and model host. LocalPitch keeps the data, the tools, the approvals, and the credits.

Start from `.env.example`, then apply `.env.localpitch.example`. Do not invent variables. Every name below already exists.

## Model

Set `GEMINI_API_KEY`, `PI_DEFAULT_PROVIDER=google`, and `PI_DEFAULT_MODEL=gemini-3.8-flash`.

`PI_DEFAULT_PROVIDER` chooses which deployment key a run may use. `google` reads `GEMINI_API_KEY` and, when `PI_DEFAULT_MODEL` is empty, `gemini-3.8-flash`. The id is unprefixed. `google/gemini-3.8-flash` is an OpenRouter id, not a Google id. A bot with no model of its own uses this pair. A member can still connect their own key; LocalPitch does not ask them to. OpenRouter still uses `OPENROUTER_API_KEY`, and Anthropic still uses `ANTHROPIC_API_KEY`. One vendor's key is never used for another.

`GEMINI_API_KEY` is already passed into the Compose API and worker. There is no separate `DEFAULT_MODEL` variable.

## Sign-in

LocalPitch is the OpenID Connect provider (Better Auth oauth-provider). Register this redirect on the LocalPitch client `localpitch-agent`:

```text
https://agent.example.com/api/auth/callback/oidc
```

Use the same origin as `BETTER_AUTH_URL`. The issuer must be HTTPS and must match discovery (`https://app.example.com`).

```env
OIDC_ISSUER=https://app.example.com
OIDC_CLIENT_ID=
OIDC_CLIENT_SECRET=
OIDC_NAME=LocalPitch
AUTH_PASSWORD_ENABLED=false
SIGNUPS_ENABLED=true
SIGNUP_ALLOWLIST=
OIDC_ALLOW_SIGNUP_BYPASS=true
```

`OIDC_CLIENT_ID` and `OIDC_CLIENT_SECRET` are LocalPitch's `OIDC_RAKAZO_CLIENT_ID` and `OIDC_RAKAZO_CLIENT_SECRET`.

What the code does with that combination:

- `AUTH_PASSWORD_ENABLED=false` refuses password sign-in, password sign-up, password reset, password changes, and email one-time codes. Passkeys are not registered. The API will not start this way unless all three OIDC values are set. The sign-in screen then has one button, **Continue with LocalPitch** (`OIDC_NAME` is inserted into the existing "Continue with {name}" label).
- `SIGNUPS_ENABLED=true` is required for a first visit. `OIDC_ALLOW_SIGNUP_BYPASS=true` does **not** reopen closed registration. With `SIGNUPS_ENABLED=false`, a new IdP identity gets `REGISTRATION_CLOSED` whether or not bypass is on. An account that already exists can still sign in.
- An empty `SIGNUP_ALLOWLIST` allows every address. Bypass is what keeps that true if an allowlist is added later, and it skips the allowlist's extra "email must be verified" check. LocalPitch decides who can authenticate. Provider emails are still stored unverified when the `email_verified` claim is not the boolean `true`.
- Nobody else gets in. Direct `POST /api/auth/sign-up/email` returns `PASSWORD_AUTH_DISABLED`. Leave `MESSAGING_OPEN_SIGNUP=false` and do not set Telegram, WhatsApp, Sendblue, Slack, or Lark credentials, so those surfaces never mount.

## What stays off

Leave `COMPOSIO_API_KEY`, `PIPEDREAM_CLIENT_ID`, `PIPEDREAM_CLIENT_SECRET`, `PIPEDREAM_PROJECT_ID`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET` unset. Billing inside this server stays off. LocalPitch's plans are the only billing.

Email is Resend: `EMAIL_PROVIDER=resend`, `EMAIL_API_KEY` (LocalPitch's sending key), and `EMAIL_FROM`. Account mail (deletion codes) needs it. It does not reopen password sign-up while password auth is off.

`SANDBOX_PROVIDER=none`. Do not set an E2B, Daytona, Novita, CreateOS, Boat, or Railway sandbox token. Chat does not need a computer. The production Compose file defaults `SANDBOX_PROVIDER` to `e2b` when the variable is missing; set `none` explicitly. Do not add `docker-compose.prod.docker.yml`.

`CLOUD_AGENT_PROVIDER=none`. `PHONE_CALLS_ENABLED=false`. Voice and Telegram are later work (not this setup). Do not add Twilio.

`MAX_UPLOAD_SIZE_MB=10` (also the built-in default). `MAX_TOOL_CALLS_PER_TURN=25` stops a turn that keeps calling tools and still asks the model for a final reply. `0` or empty means no fuse.

## Built-in web search

With no search key, `web_search` fetches DuckDuckGo's HTML results page. There is no environment variable that turns it off. LocalPitch's research tool replaces it. On the Grana bot, open the bot's **Tools** setting and disable **Web search** (`disabledBuiltinTools` includes `web_search`). `docs/localpitch/scripts/setup-grana.mjs` does that. `web_fetch` stays available for a page the user named.

## Approvals

`ApprovalModeSchema` is `never`, `auto`, or `ask`. There is no environment variable for it.

A new account has no stored row. The run then treats the mode as **Auto** (`enabled` defaults to true when the row is missing). Auto asks before a change until an approval model is connected. Do not set `RAKAZO_AUTO_REVIEW_PROVIDER` or `TYPESAFE_API_KEY`, so this server has no deployment checker.

Set the account to **Ask** anyway (**Settings → Approvals**, or `POST /rpc/autoReview/set` with `{ "mode": "ask" }`). Ask does not pass a write just because a model is connected later. The setup script sends that call.

OpenAPI import marks `readOnly` only for `GET`. The connector then forces `readOnly` off unless the method is `GET` and the flag is still true. A tool with `readOnly: false` always needs approval, so every OpenAPI `POST` (including `propose_action`) asks in Ask mode before it runs. A `GET` whose name does not look like `get`, `list`, `search`, `find`, or `read` also asks. `whoami` asks. `get_credit_balance` does not. Webhook and routine runs cannot click through an ask; a write on the "LocalPitch job" routine is refused unless a saved rule allows that tool. Outgoing work still goes through LocalPitch `propose_action`, which itself is a `POST` and will ask here as well as in LocalPitch.

## Content encryption

`CONTENT_ENCRYPTION` unset is **on** for Compose, published images, and Railway, and **off** only when `NODE_ENV=development` or `RAKAZO_ALLOW_DEV_SECRETS=1`. Set `CONTENT_ENCRYPTION=on` in production so a dev flag cannot turn it off. It uses `ENCRYPTION_KEY` (optional `ENCRYPTION_MASTER_KEYS`). No second paid service. Reads still decrypt old ciphertext if you later set `off`. Details: `docs/content-encryption.md`.

Back up `ENCRYPTION_KEY` somewhere other than the server and its disk backups. A database dump without that key does not reveal message text.

## Docker Compose on a small VPS

Use the existing production stack. It already runs Caddy for HTTPS. Point `agent.example.com` at the VM (TCP 80/443, UDP 443).

```bash
sudo --preserve-env=SSH_CONNECTION DEPLOY_USER=deploy bash infra/compose/harden-host.sh
```

Clone this fork, copy `.env.example` to `.env`, apply `.env.localpitch.example`, and set `RAKAZO_HOST=agent.example.com`. `Caddyfile.prod` serves `{$RAKAZO_HOST}`. Generate `POSTGRES_PASSWORD`, `POSTGRES_APP_PASSWORD`, `BETTER_AUTH_SECRET`, `ENCRYPTION_KEY`, and `SCREEN_PROXY_SECRET` as different long random values. `SCREEN_PROXY_SECRET` is still required at startup when computers are off.

```bash
docker compose --env-file .env -f infra/compose/docker-compose.prod.yml \
  build --build-arg GIT_SHA=$(git rev-parse HEAD)
docker compose --env-file .env -f infra/compose/docker-compose.prod.yml \
  up -d --wait --pull never
curl --fail https://agent.example.com/health
```

`/health` is liveness and is what Caddy exposes. Revision, runtime, and sandbox stay on the API's `/internal/health`, which the edge does not route:

```bash
docker compose --env-file .env -f infra/compose/docker-compose.prod.yml exec api \
  node -e "fetch('http://127.0.0.1:3100/internal/health').then(r=>r.text()).then(console.log)"
```

With `SANDBOX_PROVIDER=none` that report should show no computer provider. Compose healthchecks on Postgres, API, and web are already in `docker-compose.prod.yml`. `up --wait` blocks until they pass.

### Postgres backup

The database is the Compose service `postgres`. Content encryption means a dump is not readable chat, but it is still the only copy of the wrapped keys and the rows. Back up the database, the `data` volume, and `ENCRYPTION_KEY` together, and test a restore.

From a source checkout, `./scripts/backup.sh` runs `pg_dump` and archives `data/`. On this stack, dump as the owner role (the app login cannot see every row):

```bash
docker compose --env-file .env -f infra/compose/docker-compose.prod.yml exec -T postgres \
  sh -c 'pg_dump -Fc -U "$POSTGRES_USER" "$POSTGRES_DB"' > rakazo.dump
```

Keep the dump private. Restoring is `pg_restore` into an empty volume, then start the stack with the same `ENCRYPTION_KEY`. `docs/self-host.md` has the age-encrypted and PITR variants. Do not delete the Postgres volume to fix a bad deploy.

## Railway

`infra/railway/README.md` is the upstream template (app, Postgres, and Railway computers). For LocalPitch, do not use the computer half: set `SANDBOX_PROVIDER=none`, do not set `RAILWAY_API_TOKEN`, and do not create a sandbox environment. Deploy Postgres and the app service from that template or from this image, with the same `.env.localpitch.example` values and a generated public domain as `RAKAZO_HOST` / the three origin URLs.

The template's volume backups need a Railway Pro workspace. Volume persistence is not a backup. Also take a `pg_dump` and store `ENCRYPTION_KEY` off Railway. One app replica. Do not enable service sleeping. Health is the service's HTTPS `/health`.

## After the first sign-in

1. Sign in with **Continue with LocalPitch**. A password form should not be offered, and a direct sign-up is refused.
2. Run `docs/localpitch/scripts/setup-grana.mjs` and `install-role-skills.mjs` (see `CONNECT.md`).
3. Paste the bot instructions from `docs/localpitch/roles/main-assistant.md` if the script did not (it writes them only when the bot's instructions are empty).
4. Add the LocalPitch OpenAPI tool source (`CONNECT.md`) and call `whoami`.
