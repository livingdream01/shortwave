# Instagram Connection Setup (no Meta app → live posting)

This is the **App-Review-free** path: because you own the Meta app and the target
account, you can post to *your own* Instagram while the app is in Development Mode.
App Review is only required to post to *other people's* accounts.

> Time: ~20–30 minutes. Prerequisites: an Instagram **professional account**
> (Business or Creator) and a Facebook/Meta developer account.

## 1. Confirm the account type
Instagram app → Settings → Account type → switch to **Business** or **Creator** if
not already. Note the username.

## 2. Create the Meta app
1. Go to <https://developers.facebook.com/apps> → **Create app** → use case
   **"Other"** → type **Business**.
2. Name it (e.g. `shortwave`). It will be in **Development Mode** — leave it there.
3. Add the **Instagram** product → **Instagram API with Instagram Login**
   (this avoids needing a Facebook Page and uses `graph.instagram.com`).

## 3. Configure OAuth
In the Instagram product settings:
- **Valid OAuth Redirect URI**: `http://localhost:3040/api/oauth/instagram`
  (must exactly match `IG_REDIRECT_URI`).
- Add yourself as an app **Admin** (you already are, as creator) and, if posting
  from a different account, add it under **Roles → Testers/Developers**.

Required scopes (already set in `app/api/oauth/instagram/route.ts`):
- `instagram_business_basic`
- `instagram_business_content_publish`
- `instagram_manage_insights`

## 4. Fill environment
Copy `.env.example` → `.env.local` and set:
```
IG_APP_ID=<App ID>
IG_APP_SECRET=<App Secret>
IG_REDIRECT_URI=http://localhost:3040/api/oauth/instagram
IG_GRAPH_HOST=https://graph.instagram.com
IG_API_VERSION=v23.0
```

## 5. Run the OAuth flow
1. `supabase start` then `npm run dev` (portal on :3040).
2. Sign in at <http://localhost:3040/login> with a magic link (read it in Mailpit
   at <http://127.0.0.1:54324>), then open **/connections**.
3. Click **Connect Instagram** → you approve the scopes in your own browser.
4. You land back on `/connections`; the long-lived token is **encrypted
   (AES-256-GCM) and stored in the `accounts` vault** — never in a file, never in
   the browser. See `13-auth-and-vault.md`.

## 6. Publish a reel
```
npm run worker -- --publish
```
The worker resolves the token from the vault (`lib/publish/token-source.ts`),
uploads the rendered MP4 to the public Supabase bucket, then calls
`createContainer` → poll `status_code` → `media_publish` with `is_ai_generated=true`.
(For ad-hoc CLI runs you can still override with `SHORTWAVE_IG_USER_ID` /
`SHORTWAVE_IG_TOKEN`.)

## 7. Keep the token alive
Long-lived tokens expire after ~60 days. `needsRefresh()` flags a token within **7
days** of expiry; `refreshLongLived()` extends it. Wire it into the daily cron
(`10-runbooks.md`).

## Notes & gotchas
- The video URL must be **publicly reachable** — Instagram fetches it by URL.
- Rate limit: ~50–100 API-published posts / 24h.
- Use a **secondary/test account** first (`accounts.is_test = true`) or publish
  **trial reels** so experiments never touch your main audience.
- Page Publishing Authorization (PPA) only applies to Page-linked setups; the
  Instagram-Login path above avoids it.
