import { NextRequest, NextResponse } from "next/server";
import { getAccess } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeUrl } from "@/lib/sanitize";
import { generateScanFindings, calculateRiskScore } from "@/lib/threat-data";
import { createDemoWorkspace } from "@/lib/demo-data";
import { SCAN_TYPES } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const access = await getAccess();
    if (!access)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (
      !rateLimit(
        `scan:${access.demo ? request.cookies.get("sentinel-demo")?.value.slice(-20) : access.id}`,
        { windowMs: 60000, maxRequests: 10 },
      ).success
    )
      return NextResponse.json(
        { error: "Scan limit reached. Please wait a minute." },
        { status: 429 },
      );
    const body = await request.json().catch(() => null);
    const { url, scanType = "full" } = body || {};
    if (
      typeof url !== "string" ||
      url.length > 2048 ||
      !SCAN_TYPES.some((type) => type.value === scanType)
    )
      return NextResponse.json(
        { error: "Enter a valid URL and choose a supported scan profile." },
        { status: 400 },
      );
    const targetUrl = sanitizeUrl(url.trim());
    if (!targetUrl)
      return NextResponse.json(
        {
          error:
            "Use an HTTP or HTTPS URL with a public hostname and no embedded credentials.",
        },
        { status: 400 },
      );
    const findings = generateScanFindings(targetUrl, scanType);
    const riskScore = calculateRiskScore(findings);
    const now = new Date().toISOString();
    if (access.demo)
      return NextResponse.json({
        id: crypto.randomUUID(),
        targetUrl,
        scanType,
        status: "completed",
        riskScore,
        findings,
        startedAt: now,
        completedAt: now,
        simulated: true,
      });
    const scan = await prisma.scanResult.create({
      data: {
        targetUrl,
        scanType,
        status: "completed",
        riskScore,
        findings: JSON.stringify(findings),
        completedAt: new Date(),
        userId: access.id,
      },
    });
    return NextResponse.json({ ...scan, findings, simulated: true });
  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json(
      {
        error:
          "Unable to save the scan. Check your database connection and try again.",
      },
      { status: 500 },
    );
  }
}
export async function GET() {
  try {
    const access = await getAccess();
    if (!access)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (access.demo) return NextResponse.json(createDemoWorkspace().scans);
    const scans = await prisma.scanResult.findMany({
      where: { userId: access.id },
      orderBy: { startedAt: "desc" },
      take: 50,
    });
    return NextResponse.json(
      scans.map((scan) => ({ ...scan, findings: JSON.parse(scan.findings) })),
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to load scan history. Check your database connection." },
      { status: 500 },
    );
  }
}
