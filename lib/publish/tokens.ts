import { config } from "../config";

export interface IgToken {
  accessToken: string;
  /** Epoch ms. */
  expiresAt: number;
  userId: string;
}

const DAY = 24 * 60 * 60 * 1000;

/** True when a token expires within `windowMs` (default 7 days). */
export function needsRefresh(
  expiresAt: number,
  now: number = Date.now(),
  windowMs: number = 7 * DAY,
): boolean {
  return expiresAt - now <= windowMs;
}

/** Throw loudly if the token is already expired (Review Focus #2). */
export function assertUsable(token: IgToken, now: number = Date.now()): void {
  if (now >= token.expiresAt) {
    throw new Error(
      `Instagram token for ${token.userId} expired at ${new Date(
        token.expiresAt,
      ).toISOString()} — refresh required`,
    );
  }
}

async function formPost<T>(
  url: string,
  params: Record<string, string>,
  fetchImpl: typeof fetch,
): Promise<T> {
  const res = await fetchImpl(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params).toString(),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`OAuth ${res.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text) as T;
}

async function getJsonAuth<T>(
  url: string,
  fetchImpl: typeof fetch,
): Promise<T> {
  const res = await fetchImpl(url);
  const text = await res.text();
  if (!res.ok) throw new Error(`OAuth ${res.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text) as T;
}

export interface CodeExchangeInput {
  code: string;
  appId?: string;
  appSecret?: string;
  redirectUri?: string;
  fetchImpl?: typeof fetch;
}

/** Exchange an OAuth code for a short-lived token. */
export async function exchangeCode(
  input: CodeExchangeInput,
): Promise<{ accessToken: string; userId: string }> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const appId = input.appId ?? config.instagram.appId;
  const appSecret = input.appSecret ?? config.instagram.appSecret;
  const redirectUri = input.redirectUri ?? config.instagram.redirectUri;
  if (!appId || !appSecret) throw new Error("IG_APP_ID / IG_APP_SECRET not set");

  const data = await formPost<{ access_token: string; user_id: string }>(
    "https://api.instagram.com/oauth/access_token",
    {
      client_id: appId,
      client_secret: appSecret,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code: input.code,
    },
    fetchImpl,
  );
  return { accessToken: data.access_token, userId: String(data.user_id) };
}

/** Trade a short-lived token for a long-lived (≈60-day) token. */
export async function toLongLived(input: {
  shortToken: string;
  userId: string;
  appSecret?: string;
  fetchImpl?: typeof fetch;
}): Promise<IgToken> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const appSecret = input.appSecret ?? config.instagram.appSecret;
  if (!appSecret) throw new Error("IG_APP_SECRET not set");

  const host = config.instagram.graphHost;
  const url =
    `${host}/access_token?grant_type=ig_exchange_token` +
    `&client_secret=${encodeURIComponent(appSecret)}` +
    `&access_token=${encodeURIComponent(input.shortToken)}`;
  const data = await getJsonAuth<{ access_token: string; expires_in: number }>(
    url,
    fetchImpl,
  );
  return {
    accessToken: data.access_token,
    userId: input.userId,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

/** Refresh a long-lived token (call when needsRefresh() is true). */
export async function refreshLongLived(
  token: IgToken,
  fetchImpl: typeof fetch = fetch,
): Promise<IgToken> {
  const host = config.instagram.graphHost;
  const url =
    `${host}/refresh_access_token?grant_type=ig_refresh_token` +
    `&access_token=${encodeURIComponent(token.accessToken)}`;
  const data = await getJsonAuth<{ access_token: string; expires_in: number }>(
    url,
    fetchImpl,
  );
  return {
    accessToken: data.access_token,
    userId: token.userId,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}
