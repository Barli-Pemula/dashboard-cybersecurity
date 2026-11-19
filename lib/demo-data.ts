import { generateScanFindings, calculateRiskScore } from "@/lib/threat-data";
import type { Workspace, Threat } from "@/lib/types";

export function createDemoWorkspace(): Workspace {
  const now = Date.now();
  const ago = (hours: number) => new Date(now - hours * 3600000).toISOString();
  const scans = [
    "https://portal.example.com",
    "https://api.example.com",
    "https://status.example.com",
  ].map((targetUrl, i) => {
    const findings = generateScanFindings(
      targetUrl,
      i === 1 ? "headers" : "full",
    );
    return {
      id: `demo-scan-${i}`,
      targetUrl,
      scanType: i === 1 ? "headers" : "full",
      status: "completed",
      riskScore: calculateRiskScore(findings),
      findings,
      startedAt: ago(i * 4 + 1),
      completedAt: ago(i * 4 + 1),
    };
  });
  const templates = [
    {
      type: "Credential stuffing",
      severity: "high",
      target: "Authentication service",
      status: "blocked",
    },
    {
      type: "Suspicious HTTP request",
      severity: "medium",
      target: "API gateway",
      status: "monitored",
    },
    {
      type: "SQL injection attempt",
      severity: "critical",
      target: "Customer portal",
      status: "active",
    },
    {
      type: "Port scan detected",
      severity: "low",
      target: "Public gateway",
      status: "blocked",
    },
    {
      type: "Unusual sign-in pattern",
      severity: "high",
      target: "Authentication service",
      status: "active",
    },
    {
      type: "Policy check completed",
      severity: "info",
      target: "Edge firewall",
      status: "resolved",
    },
  ];
  const threats: Threat[] = Array.from({ length: 96 }, (_, i) => ({
    ...templates[i % templates.length],
    id: `demo-event-${i}`,
    source: `192.0.2.${10 + (i % 220)}`,
    details: "A simulated event for exploring the demo workspace.",
    timestamp: ago(0.02 + 23 * Math.pow(i / 95, 0.82) + 0.1 * Math.sin(i)),
  }));
  return {
    scans,
    threats,
    reports: [
      {
        id: "demo-report-1",
        title: "Customer portal assessment",
        type: "assessment",
        status: "review",
        severity: "high",
        summary:
          "Demo assessment of the customer portal. Review the simulated header and transport findings, document an owner, and schedule a follow-up scan.",
        findings: scans[0].findings,
        createdAt: ago(2),
        updatedAt: ago(2),
      },
      {
        id: "demo-report-2",
        title: "API gateway header review",
        type: "audit",
        status: "draft",
        severity: "medium",
        summary:
          "Demo review of HTTP response policies on the API gateway. The findings are illustrative and do not describe a real system.",
        findings: scans[1].findings,
        createdAt: ago(8),
        updatedAt: ago(8),
      },
      {
        id: "demo-report-3",
        title: "Weekly security summary",
        type: "incident",
        status: "published",
        severity: "low",
        summary:
          "Demo incident summary for practicing report review and export. No production systems or live incident feeds are connected.",
        findings: [],
        createdAt: ago(26),
        updatedAt: ago(26),
      },
    ],
  };
}
