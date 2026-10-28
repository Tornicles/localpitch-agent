<!-- Modified by LocalPitch, 2026 -->

# Connect LocalPitch tools

LocalPitch is the only tool source. The document is `https://app.<domain>/api/agent/openapi.json`. Calls go to the `servers[0].url` in that document (`https://app.<domain>/api/agent/v1`) with `Authorization: Bearer <token>`.

## Add the tool source

In LocalPitch, open **Settings → Assistant** and create a token. It is shown once and starts with `lp_at_`.

In this server, after **Continue with LocalPitch**:

1. Open tool sources and add an API source.
2. Name it `LocalPitch`.
3. Source URL: `https://app.<domain>/api/agent/openapi.json`.
4. Turn on OpenAPI import (`openapi: true` on the install).
5. Auth type: bearer. Paste the token only in the credential field, not in the URL.

The same call is `POST /rpc/capabilities/install` with a signed-in session:

```json
{
  "json": {
    "kind": "api",
    "name": "LocalPitch",
    "source": "https://app.example.com/api/agent/openapi.json",
    "config": { "openapi": true, "auth": { "type": "bearer" } },
    "credential": "lp_at_…"
  }
}
```

Import keeps operations that have an `operationId`, at most 100. `GET` is stored read-only. `POST` is not, so Ask mode asks before it runs (see `DEPLOY.md`). A missing or revoked token fails the call; it is not logged back into the tool result (the connector redacts the credential).

Check it with `whoami` (`GET /me`). The result is the LocalPitch user, workspace, and agent label. In Ask mode the chat asks before `whoami` because the name is not `get`/`list`/`search`/`find`/`read`. Approve that one call. `get_credit_balance` does not ask on name alone.

## One source, every bot

An OpenAPI install is stored on the account (`allSpaces: true`). Discovery loads every `api` install in the space. There is no bot id on the install, and no assignment table for API sources.

MCP servers are different: `BotMcpServer` can limit a server to one bot. LocalPitch publishes OpenAPI, not MCP, so that assignment does not apply.

A custom agent therefore cannot be given its own bearer token on this server. Mint one token in LocalPitch whose areas are the areas that person already has, and put it on the single LocalPitch source. Every bot of that account, including custom agents, calls with that token.

Do not try to scope a custom agent by letting the model send `X-LP-Agent`. This server only sends headers the OpenAPI operation declares, plus the bearer credential. A model-filled header is not a boundary: the model can send any value. LocalPitch must not treat a model-supplied `X-LP-Agent` as proof of which agent is calling. Area limits for custom agents need a header this server sets itself. That does not exist today. Until it does, custom-agent area checks in LocalPitch only see the shared token's areas.

`X-LP-Job` is the same shape. The runner routine tells the model to send it. The model can send it only when each LocalPitch operation declares an optional header parameter named `X-LP-Job` (that name is not treated as a secret header, so import will keep it). A static install header cannot carry a different job id per call. If the document does not declare the header, job credit caps that depend on it will not see a job id.

## Custom agents

Create the bot in this server (name, colour, instructions). Start the instructions from a file in `docs/localpitch/roles/`. LocalPitch still mints and stores that agent's token for its own records, but this server can only attach one of those tokens to the shared source. Tell the person that the other token is unused here until per-bot sources exist.

## Roles as skills

Role files are SKILL.md. `docs/localpitch/scripts/install-role-skills.mjs` posts each one except `main-assistant.md` to `POST /rpc/agentSkills/create`. The main assistant's text is the Grana bot's instructions, not a skill it calls on itself. Hand off inside the same bot with `Use skill: Scout` (and the other names). That expands the skill into the turn. It does not spawn a subagent or a peer bot.

## LocalPitch job webhook

`docs/localpitch/scripts/setup-grana.mjs` creates a routine named `LocalPitch job` with `webhookEnabled: true`, sets approvals to Ask, disables `web_search` on that bot, and rotates the bot webhook secret.

The secret is random. This API does not accept a secret you choose. Copy the printed value into LocalPitch as that bot's runner webhook secret (`RUNNER_WEBHOOK_SECRET` for the default bot, or the per-bot secret LocalPitch stores). Rotating again invalidates the previous value.

LocalPitch then calls:

```text
POST https://agent.<domain>/api/v1/bots/<botId>/webhook
Authorization: Bearer <that secret>
Content-Type: application/json

{"job_id":"<id>"}
```

The body is untrusted. The routine prompt tells the bot to load the job with `get_job`, follow those instructions, send `X-LP-Job` when the tool allows it, use `propose_action` instead of sending, and finish with `finish_job`.

Run the script only on a machine you trust. It needs a session cookie from a signed-in browser request to this server. It does not print the cookie.

```bash
AGENT_ORIGIN=https://agent.example.com \
SESSION_COOKIE='<Cookie header from a signed-in request>' \
BOT_ID='<Grana bot id>' \
node docs/localpitch/scripts/setup-grana.mjs

AGENT_ORIGIN=https://agent.example.com \
SESSION_COOKIE='<same cookie>' \
node docs/localpitch/scripts/install-role-skills.mjs
```

Add `--write-instructions` to replace the bot's instructions with `roles/main-assistant.md`. Without it, instructions are written only when they are empty.
