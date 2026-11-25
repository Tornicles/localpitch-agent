# Grana upstream dependency audit

The checkout is a LocalPitch fork of Rakazo. Commit `113cd44` says it was set up as LocalPitch's assistant server. Package name, database role, Compose user, and container image names remain `rakazo`.

| Kind | Example | Action in this pass |
|---|---|---|
| Customer-facing branding | README install text, web copy, `ghcr.io/elie222/rakazo/app` | Not bulk-renamed. A global replace would break imports, volumes, and env names |
| Internal package name | `@rakazo/*` | Kept |
| Database compatibility | `POSTGRES_USER=rakazo`, database `rakazo` | Kept. Existing volumes bind the first-init role |
| Container image | `rakazo/computer:local` | Kept. Tag `local` builds from this checkout |
| Environment names | `RAKAZO_*` | Kept. Compose and tests read them |
| License | `Apache-2.0` in `package.json`, `LICENSE` | Left in place |
| Upstream installer | README references published Rakazo images | Not used. No installer was downloaded |

Optional commercial adapters remain in the tree and stay inactive when their keys are empty: E2B, Daytona, Boat, Novita, CreateOS, Cursor, Composio, Pipedream, Supermemory.
