import { NextResponse } from "next/server";
import { buildHealth } from "../../../lib/health";

export async function GET() {
  const report = await buildHealth();
  return NextResponse.json(report, { status: report.ok ? 200 : 503 });
}
