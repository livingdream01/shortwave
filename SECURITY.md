# Security Policy

## Reporting a vulnerability
Please report security issues **privately** — do not open a public issue.
Use GitHub's "Report a vulnerability" (Security → Advisories) on this repository.

Include: what you found, how to reproduce it, and the impact. We aim to acknowledge
within 72 hours.

## Handling secrets
Shortwave is designed so that **no secret ever lives in the repo**:
- `.env.local` is gitignored; only `.env.example` (with empty values) is committed.
- App credentials (`IG_APP_ID`/`IG_APP_SECRET`) and the vault key (`SW_TOKEN_KEK`)
  live only in the deployment environment.
- Platform OAuth tokens are **encrypted at rest** (AES-256-GCM) and readable only by
  the service role; the browser never receives them.
- The portal is protected by Supabase Auth and an operator allowlist.

## If a secret leaks
1. Rotate it at the source (Meta app secret, Resend key, vault key, provider keys).
2. If `SW_TOKEN_KEK` leaked, re-encrypt all `accounts` rows with a new key and
   re-run every connected account's OAuth.
3. Re-connected platform tokens invalidate the old ones.

## Scope
Automation against platforms is done **only** through official APIs (Instagram
Content Publishing, TikTok Content Posting). We do not support credential-based or
unofficial automation; such PRs will be declined.
