import { NextResponse, type NextRequest } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { config } from "../../../../lib/config";
import { exchangeCode, toLongLived } from "../../../../lib/publish/tokens";

const SCOPES = [
  "instagram_business_basic",
  "instagram_business_content_publish",
  "instagram_manage_insights",
].join(",");

function authorizeUrl(): string | null {
  const { appId, redirectUri } = config.instagram;
  if (!appId) return null;
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES,
  });
  return `https://www.instagram.com/oauth/authorize?${params.toString()}`;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error_description") ?? url.searchParams.get("error");

  if (error) return NextResponse.json({ error }, { status: 400 });

  if (!code) {
    const target = authorizeUrl();
    if (!target) {
      return NextResponse.json(
        { error: "IG_APP_ID not set. Create the Meta app and set IG_APP_ID first." },
        { status: 500 },
      );
    }
    return NextResponse.json({ authorizeUrl: target, scopes: SCOPES });
  }

  const short = await exchangeCode({ code });
  const token = await toLongLived({
    shortToken: short.accessToken,
    userId: short.userId,
  });

  const tokenPath = path.resolve("out/.ig-token.json");
  await mkdir(path.dirname(tokenPath), { recursive: true });
  await writeFile(tokenPath, JSON.stringify(token), "utf8");

  return NextResponse.json({
    ok: true,
    userId: token.userId,
    expiresAt: new Date(token.expiresAt).toISOString(),
    hint: "Token stored at out/.ig-token.json. Export SHORTWAVE_IG_USER_ID and SHORTWAVE_IG_TOKEN to publish.",
  });
}
