import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeUrl } from "@/lib/sanitize";
import {
  generateScanFindings,
  calculateRiskScore,
} from "@/lib/threat-data";

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    const userId = (session.user as { id?: string }).id || "unknown";
    const limiter = rateLimit(`scan:${userId}`, {
      windowMs: 60 * 1000,
      maxRequests: 10,
    });

    if (!limiter.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { url, scanType = "full" } = body;

    if (!url) {
      return NextResponse.json(
        { error: "Target URL is required" },
        { status: 400 }
      );
    }

    const sanitizedUrl = sanitizeUrl(url);
    if (!sanitizedUrl) {
      return NextResponse.json(
        { error: "Invalid URL. Only HTTP/HTTPS URLs to public hosts are allowed." },
        { status: 400 }
      );
    }

    // Simulate scan — generate findings
    const findings = generateScanFindings(sanitizedUrl);
    const riskScore = calculateRiskScore(findings);

    // Save to database
    const scan = await prisma.scanResult.create({
      data: {
        targetUrl: sanitizedUrl,
        scanType,
        status: "completed",
        riskScore,
        findings: JSON.stringify(findings),
        completedAt: new Date(),
        userId,
      },
    });

    return NextResponse.json({
      id: scan.id,
      targetUrl: scan.targetUrl,
      scanType: scan.scanType,
      status: scan.status,
      riskScore: scan.riskScore,
      findings,
      startedAt: scan.startedAt,
      completedAt: scan.completedAt,
    });
  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json(
      { error: "Failed to execute scan" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id || "unknown";

    const scans = await prisma.scanResult.findMany({
      where: { userId },
      orderBy: { startedAt: "desc" },
      take: 20,
    });

    return NextResponse.json(
      scans.map((scan) => ({
        ...scan,
        findings: JSON.parse(scan.findings),
      }))
    );
  } catch (error) {
    console.error("Error fetching scans:", error);
    return NextResponse.json(
      { error: "Failed to fetch scan history" },
      { status: 500 }
    );
  }
}
