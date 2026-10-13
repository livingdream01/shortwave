import { NextResponse } from "next/server";
import { config } from "../../../../../lib/config";

const SCOPES = [
  "instagram_business_basic",
  "instagram_business_content_publish",
  "instagram_manage_insights",
].join(",");

export async function GET() {
  const { appId, redirectUri } = config.instagram;
  if (!appId) {
    return NextResponse.json(
      { error: "IG_APP_ID not set. Create the Meta app and set it in .env.local." },
      { status: 500 },
    );
  }
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES,
  });
  return NextResponse.redirect(
    `https://www.instagram.com/oauth/authorize?${params.toString()}`,
  );
}
