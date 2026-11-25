# Grana environment register

Source: `.env.example` and `infra/compose/docker-compose.yml`. Values below are names and behavior, not secrets.

| Name | Service | Required | Purpose | Secret | Default | If missing |
|---|---|---|---|---|---|---|
| `OPENAI_API_KEY` | API, worker | For the OpenAI profile | Direct OpenAI calls | Yes | empty | Provider `openai` is not configured |
| `PI_DEFAULT_PROVIDER` | API, worker | No | Deployment model vendor | No | code fallback `openrouter`; example `openai` | OpenRouter fallback |
| `PI_DEFAULT_MODEL` | API, worker | For OpenAI, set `gpt-6-luna` | Catalog model id | No | provider map | OpenRouter id if provider is openrouter |
| `AGENT_RUNTIME` | API, worker | No | Agent loop | No | `pi` | Pi |
| `DATABASE_URL` | API, worker | Yes in Compose | Runtime Postgres login | Yes | composed from `POSTGRES_APP_PASSWORD` | Process cannot start |
| `DATABASE_MIGRATION_URL` | migrate | Yes in Compose | Owner login | Yes | composed from `POSTGRES_PASSWORD` | Migrations do not run |
| `POSTGRES_PASSWORD` | postgres, migrate | Yes | Database owner | Yes | empty, Compose refuses | Compose fails closed |
| `POSTGRES_APP_PASSWORD` | API, worker, migrate | Yes | Runtime login | Yes | empty, Compose refuses | Compose fails closed |
| `BETTER_AUTH_SECRET` | API | Yes outside local preview | Session signing | Yes | placeholder | Auth refuses in production |
| `ENCRYPTION_KEY` | API, worker | Yes for stored secrets | Content and credential encryption | Yes | placeholder | Secret storage cannot start safely |
| `SANDBOX_PROVIDER` | API, worker | No | Computer backend | No | `docker` | Docker |
| `SANDBOX_SUPERVISOR_URL` | API, worker | For Docker computers | Supervisor address | No | `http://supervisor:7091` in Compose | Computer calls fail |
| `SANDBOX_SUPERVISOR_TOKEN` | API, worker, supervisor | Yes for Docker | Supervisor auth | Yes | placeholder, Compose refuses | Supervisor refuses |
| `SCREEN_PROXY_SECRET` | API, screen proxy | Yes outside local dev | Viewer auth | Yes | placeholder | Viewer refuses |
| `CLOUD_AGENT_PROVIDER` | API, worker | No | External coding agent | No | `none` | No cloud agent |
| `SANDBOX_COMPUTER_EGRESS` | supervisor | No | Computer network policy | No | `auto` in Compose | Documented restricted path needs the host script |
| `CURSOR_API_KEY` | API, worker | No | Cursor cloud agent | Yes | empty | Cloud agent stays off |

`OPENAI_API_KEY` is server-side. The computer image does not receive it in the supervisor service environment shown in Compose. Model calls stay on the API and worker.

The full template remains `.env.example`. The independence profile is `.env.independence.example`.
