import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Fetch recent scans
    const recentScans = await prisma.scanResult.findMany({
      where: { userId: user.id },
      orderBy: { startedAt: "desc" },
      take: 10,
    });

    // Fetch recent reports
    const recentReports = await prisma.report.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Combine and format as personal activity
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
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
