import { NextRequest, NextResponse } from "next/server";
import { getAccess } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { stripHtml } from "@/lib/sanitize";
import { createDemoWorkspace } from "@/lib/demo-data";
import { REPORT_TYPES, SEVERITIES } from "@/lib/types";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const access = await getAccess();
    if (!access)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (
      !rateLimit(
        `report:${access.demo ? request.cookies.get("sentinel-demo")?.value.slice(-20) : access.id}`,
        { windowMs: 60000, maxRequests: 20 },
      ).success
    )
      return NextResponse.json(
        { error: "Report limit reached. Please wait a minute." },
        { status: 429 },
      );
    const body = await request.json().catch(() => null);
    const {
      title,
      summary,
      type = "assessment",
      severity = "medium",
      findings = [],
    } = body || {};
    if (
      typeof title !== "string" ||
      typeof summary !== "string" ||
      !title.trim() ||
      !summary.trim() ||
      title.length > 160 ||
      summary.length > 10000 ||
      !REPORT_TYPES.some((item) => item.value === type) ||
      !SEVERITIES.includes(severity) ||
      !Array.isArray(findings) ||
      findings.length > 100 ||
      findings.some(
        (finding) =>
          !finding ||
          typeof finding !== "object" ||
          typeof finding.title !== "string" ||
          typeof finding.description !== "string" ||
          typeof finding.recommendation !== "string" ||
          !SEVERITIES.includes(finding.severity),
      )
    )
      return NextResponse.json(
        {
          error:
            "Provide a title (up to 160 characters), a summary (up to 10,000 characters), and valid report fields.",
        },
        { status: 400 },
      );
    const cleanTitle = stripHtml(title).trim();
    const cleanSummary = stripHtml(summary).trim();
    if (!cleanTitle || !cleanSummary)
      return NextResponse.json(
        { error: "Title and summary must contain readable text." },
        { status: 400 },
      );
    const now = new Date().toISOString();
    if (access.demo)
      return NextResponse.json(
        {
          id: crypto.randomUUID(),
          title: cleanTitle,
          summary: cleanSummary,
          type,
          severity,
          findings,
          status: "draft",
          createdAt: now,
          updatedAt: now,
        },
        { status: 201 },
      );
    const report = await prisma.report.create({
      data: {
        title: cleanTitle,
        summary: cleanSummary,
        type,
        severity,
        status: "draft",
        findings: JSON.stringify(findings),
        userId: access.id,
      },
    });
    return NextResponse.json({ ...report, findings }, { status: 201 });
  } catch {
    return NextResponse.json(
      {
        error:
          "Unable to save the report. Check your database connection and try again.",
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
    if (access.demo) return NextResponse.json(createDemoWorkspace().reports);
    const reports = await prisma.report.findMany({
      where: { userId: access.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json(
      reports.map((report) => ({
        ...report,
        findings: JSON.parse(report.findings),
      })),
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to load reports. Check your database connection." },
      { status: 500 },
    );
  }
}
