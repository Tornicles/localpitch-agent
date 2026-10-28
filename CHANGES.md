<!-- Modified by LocalPitch, 2026 -->

# LocalPitch changes

Apache-2.0 section 4. This fork keeps `LICENSE` and the upstream copyright notices. The product name in the interface stays Rakazo. LocalPitch's assistant is Grana.

## Modified

- `.env.example` — documents `GEMINI_API_KEY` next to the other deployment model keys.
- `packages/adapters/src/deployment-model.ts` — `PI_DEFAULT_PROVIDER=google` uses `GEMINI_API_KEY` and defaults to `gemini-3.8-flash`. OpenRouter and Anthropic are unchanged.
- `packages/adapters/src/deployment-model.test.ts` — Gemini default, and a run with no per-user key.
- `packages/adapters/src/installed-connectors.test.ts` — fake LocalPitch OpenAPI document, `whoami` with a bearer token, POST approval flag.
- `packages/auth/src/oidc.test.ts` — OIDC sign-in as LocalPitch, direct sign-up refused.
- `apps/api/src/env.test.ts` — LocalPitch env loads with no sandbox and the Gemini deployment key.
- `apps/api/src/localpitch-setup.test.ts` — role files and the runner prompt stay intact.
- `apps/web/src/pages/AccountSettingsOverlay.tsx` — About note on General settings.
- `apps/web/src/pages/AccountSettingsOverlay.test.tsx` — covers that note.
- `apps/web/src/locales/*/messages.po` — catalog entries for the About note.
- `apps/mobile/app/(settings)/account.tsx` — the same About note.
- `apps/mobile/lib/account-screen.test.tsx` — covers that note.
- `apps/mobile/lib/locales/de.ts`
- `apps/mobile/lib/locales/ja.ts`
- `apps/mobile/lib/locales/nl.ts`
- `apps/mobile/lib/locales/ru.ts`
- `apps/mobile/lib/locales/zh.ts`
- `apps/mobile/lib/locales/zh-TW.ts`

## Added

- `.env.localpitch.example`
- `docs/localpitch/DEPLOY.md`
- `docs/localpitch/CONNECT.md`
- `docs/localpitch/roles/main-assistant.md`
- `docs/localpitch/roles/scout.md`
- `docs/localpitch/roles/auditor.md`
- `docs/localpitch/roles/listener.md`
- `docs/localpitch/roles/builder.md`
- `docs/localpitch/roles/closer.md`
- `docs/localpitch/roles/editor.md`
- `docs/localpitch/roles/clerk.md`
- `docs/localpitch/roles/cleaner.md`
- `docs/localpitch/roles/keeper.md`
- `docs/localpitch/roles/account-manager.md`
- `docs/localpitch/scripts/setup-grana.mjs`
- `docs/localpitch/scripts/install-role-skills.mjs`
- `CHANGES.md`
