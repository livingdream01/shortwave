import path from "node:path";
import { appendFile, mkdir } from "node:fs/promises";
import { config } from "./config";

export type AlertLevel = "info" | "warn" | "error";

export interface Alert {
  level: AlertLevel;
  title: string;
  detail?: string;
}

export interface NotifyDeps {
  fetchImpl?: typeof fetch;
  logPath?: string;
  resendKey?: string;
  to?: string;
  from?: string;
}

export interface NotifyResult {
  logged: string;
  emailed: boolean;
}

const line = (a: Alert) =>
  JSON.stringify({ at: new Date().toISOString(), ...a }) + "\n";

/**
 * Record an alert. Always appends to a local JSONL log; additionally emails the
 * operator via Resend when a key + recipient are configured. Never throws.
 */
export async function notify(
  alert: Alert,
  deps: NotifyDeps = {},
): Promise<NotifyResult> {
  const logPath = deps.logPath ?? path.resolve("out/alerts.log");
  await mkdir(path.dirname(logPath), { recursive: true }).catch(() => {});
  await appendFile(logPath, line(alert)).catch(() => {});

  const key = deps.resendKey ?? config.resend.apiKey;
  const to = deps.to ?? config.operatorEmail;
  const from = deps.from ?? config.resend.from;
  if (!key || !to) return { logged: logPath, emailed: false };

  try {
    const res = await (deps.fetchImpl ?? fetch)("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: `[Shortwave/${alert.level}] ${alert.title}`,
        text: alert.detail ?? alert.title,
      }),
    });
    return { logged: logPath, emailed: res.ok };
  } catch {
    return { logged: logPath, emailed: false };
  }
}
