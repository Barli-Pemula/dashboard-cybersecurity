import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAccess } from "@/lib/access";
import { createDemoWorkspace } from "@/lib/demo-data";

export async function GET() {
  try {
    const access = await getAccess();
    if (!access)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (access.demo) {
      const workspace = createDemoWorkspace();
      return NextResponse.json(
        [
          ...workspace.scans.map((scan) => ({
            id: scan.id,
            type: "scan",
            title: `Scan: ${scan.targetUrl}`,
            message: `Risk score: ${scan.riskScore}`,
            timestamp: scan.startedAt,
          })),
          ...workspace.reports.map((report) => ({
            id: report.id,
            type: "report",
            title: report.title,
            message: report.summary,
            timestamp: report.createdAt,
          })),
        ].sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
      );
    }
    const user = await prisma.user.findUnique({
      where: { id: access.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const recentScans = await prisma.scanResult.findMany({
      where: { userId: user.id },
      orderBy: { startedAt: "desc" },
      take: 10,
    });

    const recentReports = await prisma.report.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const activities = [
      ...recentScans.map((scan) => ({
        id: scan.id,
        type: "scan",
        title: `Scan: ${scan.targetUrl}`,
        message: `Risk Score: ${scan.riskScore} - Status: ${scan.status}`,
        timestamp: scan.startedAt,
        metadata: {
          targetUrl: scan.targetUrl,
          riskScore: scan.riskScore,
          status: scan.status,
          scanType: scan.scanType,
        },
      })),
      ...recentReports.map((report) => ({
        id: report.id,
        type: "report",
        title: report.title,
        message: `Type: ${report.type} - Status: ${report.status}`,
        timestamp: report.createdAt,
        metadata: {
          reportType: report.type,
          severity: report.severity,
          status: report.status,
        },
      })),
    ].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 },
    );
  }
}
