export interface HttpOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
  retries?: number;
  backoffMs?: number;
  fetchImpl?: typeof fetch;
}

export class HttpError extends Error {
  status: number;
  body: string;
  constructor(status: number, body: string, url: string) {
    super(`HTTP ${status} for ${url}: ${body.slice(0, 300)}`);
    this.name = "HttpError";
    this.status = status;
    this.body = body;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function shouldRetry(status: number): boolean {
  return status >= 500 || status === 429;
}

export async function request<T = unknown>(
  url: string,
  opts: HttpOptions = {},
): Promise<T> {
  const {
    method = "GET",
    headers = {},
    body,
    timeoutMs = 30_000,
    retries = 3,
    backoffMs = 400,
    fetchImpl = fetch,
  } = opts;

  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetchImpl(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });
      const text = await res.text();
      if (res.ok) {
        return (text.length > 0 ? JSON.parse(text) : {}) as T;
      }
      if (shouldRetry(res.status) && attempt < retries) {
        lastErr = new HttpError(res.status, text, url);
        await sleep(backoffMs * 2 ** attempt);
        continue;
      }
      throw new HttpError(res.status, text, url);
    } catch (err) {
      if (err instanceof HttpError) throw err;
      lastErr = err;
      if (attempt < retries) {
        await sleep(backoffMs * 2 ** attempt);
        continue;
      }
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new Error(`Request failed: ${String(lastErr)}`);
}

export function getJson<T = unknown>(
  url: string,
  opts: HttpOptions = {},
): Promise<T> {
  return request<T>(url, { ...opts, method: "GET" });
}

export function postJson<T = unknown>(
  url: string,
  body: unknown,
  opts: HttpOptions = {},
): Promise<T> {
  return request<T>(url, { ...opts, method: "POST", body });
}
