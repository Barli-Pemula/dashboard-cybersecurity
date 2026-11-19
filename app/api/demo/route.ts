import { NextRequest, NextResponse } from "next/server";
import {
  DEMO_COOKIE,
  DEMO_MAX_AGE,
  createDemoToken,
  demoEnabled,
} from "@/lib/demo-auth";
import { rateLimit } from "@/lib/rate-limit";

function sameOrigin(request: NextRequest) {
  try {
    const origin = new URL(request.headers.get("origin") || "");
    return ["http:", "https:"].includes(origin.protocol) && origin.host === request.headers.get("host");
  } catch { return false; }
}

export async function GET() {
  return NextResponse.json({ enabled: demoEnabled() });
}
export async function POST(request: NextRequest) {
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "Invalid request origin" },
      { status: 403 },
    );
  if (!demoEnabled())
    return NextResponse.json(
      {
        error:
          "Demo access is disabled. Enable ENABLE_DEMO to use this workspace.",
      },
      { status: 403 },
    );
  const limiter = rateLimit(
    `demo:${request.headers.get("x-forwarded-for") || "local"}`,
    { windowMs: 60000, maxRequests: 15 },
  );
  if (!limiter.success)
    return NextResponse.json(
      { error: "Too many demo requests. Please wait a minute." },
      { status: 429 },
    );
  try {
    const response = NextResponse.json({ success: true });
    response.cookies.set(DEMO_COOKIE, await createDemoToken(), {
      httpOnly: true,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
      path: "/",
      maxAge: DEMO_MAX_AGE,
    });
    return response;
  } catch {
    return NextResponse.json(
      {
        error:
          "Configure NEXTAUTH_SECRET or DEMO_SECRET to enable demo access.",
      },
      { status: 503 },
    );
  }
}
export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "Invalid request origin" },
      { status: 403 },
    );
  const response = NextResponse.json({ success: true });
  response.cookies.set(DEMO_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
