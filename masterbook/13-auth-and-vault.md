# Auth & Connections Vault

The portal is gated by **Supabase Auth (email magic link)** and stores platform
OAuth tokens in an **encrypted vault**. Passwords are never used or stored.

## Why not passwords
The Instagram Content Publishing API has no password field. It needs a Meta **app**
(App ID + App Secret) and an **OAuth token** obtained when *you* approve scopes in
your browser. So there is nothing a password could unlock here — and storing one
would be a liability.

Three kinds of secret, three places:
| Secret | Example | Where it lives |
|---|---|---|
| App credentials | `IG_APP_ID`, `IG_APP_SECRET` | deployment env only (`.env.local` / host) |
| Vault key | `SW_TOKEN_KEK` | deployment env only |
| Per-account OAuth token | long-lived IG token | **encrypted** in the DB (`accounts`) |

## Local stack
```bash
brew install supabase/tap/supabase
supabase start          # Postgres + Auth + Storage + Mailpit (email)
supabase db reset       # applies supabase/migrations/*.sql
```
Endpoints: API `http://127.0.0.1:54321`, Studio `http://127.0.0.1:54323`,
**Mailpit (read magic links here)** `http://127.0.0.1:54324`.

## Flow
```
/login  →  email magic link  →  Supabase Auth  →  session cookie
   │
   └─ /connections  →  "Connect Instagram"
          → /api/oauth/instagram/start  →  instagram.com consent (your browser)
          → callback /api/oauth/instagram (code)
             → exchange → long-lived token → AES-256-GCM seal
             → accounts.token_ct/iv/tag  (owner-scoped)
```
Publishing (`npm run worker -- --publish`) resolves the token from the vault via
`lib/publish/token-source.ts` (service role), refreshing it if within 7 days of
expiry. `SHORTWAVE_IG_USER_ID`/`SHORTWAVE_IG_TOKEN` still work as an env override
for ad-hoc CLI runs.

## Security model
- **Encryption at rest:** AES-256-GCM (`lib/vault.ts`), key from `SW_TOKEN_KEK`
  (`openssl rand -base64 32`). Tampering fails the GCM auth check.
- **Row Level Security:** `accounts` rows are visible only to their `owner_id`.
- **Column lockdown:** the client roles are granted SELECT on the *safe* columns
  only; `token_ct/iv/tag` are never readable by the browser. The UI reads a
  token-free `connections` view (`security_invoker`, so RLS still applies).
- **Allowlist:** only `OPERATOR_EMAIL` may sign in (enforced in the auth callback).
- **App Secret** never enters the DB, the repo, or the browser.

## Route gate
`proxy.ts` (Next 16 renamed `middleware` → `proxy`) redirects unauthenticated
requests to `/login`; `/login`, `/auth/*`, `/api/oauth/*` are public.

## Rotating
- **Vault key:** re-encrypt all rows with the new key (`seal`/`open`), then swap
  `SW_TOKEN_KEK`.
- **Token:** the daily cron refreshes it; `/connections` shows the expiry date.

## Troubleshooting
| Symptom | Fix |
|---|---|
| Never receive the magic link | Read it in Mailpit at `http://127.0.0.1:54324` (local), or check SMTP for cloud. |
| Redirect error after clicking the link | Ensure `site_url` + `additional_redirect_urls` in `supabase/config.toml` include `http://localhost:3040` and `/auth/callback`; `supabase stop && supabase start`. |
| `SW_TOKEN_KEK is not set` | Add it to `.env.local` (`openssl rand -base64 32`). |
| `not_allowed` after sign-in | The email is not `OPERATOR_EMAIL`. |
