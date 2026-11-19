export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type ScanType = "full" | "quick" | "ssl" | "headers";
export interface Finding {
  id: string;
  title: string;
  severity: string;
  description: string;
  recommendation: string;
  url: string;
  detectedAt: string;
}
export interface Scan {
  id: string;
  targetUrl: string;
  scanType: string;
  status: string;
  riskScore: number;
  findings: Finding[];
  startedAt: string;
  completedAt: string | null;
}
export interface Report {
  id: string;
  title: string;
  type: string;
  status: string;
  severity: string;
  summary: string;
  findings: Finding[];
  createdAt: string;
  updatedAt: string;
}
export interface Threat {
  id: string;
  type: string;
  severity: string;
  source: string;
  target: string;
  details: string;
  status: string;
  timestamp: string;
}
export interface Workspace {
  scans: Scan[];
  reports: Report[];
  threats: Threat[];
}
export interface Access {
  id: string;
  name: string;
  email: string;
  demo: boolean;
}
export const SCAN_TYPES = [
  {
    value: "full",
    label: "Full assessment",
    description: "All simulated checks",
  },
  { value: "quick", label: "Quick scan", description: "A short set of checks" },
  { value: "ssl", label: "SSL / TLS", description: "Transport configuration" },
  {
    value: "headers",
    label: "HTTP headers",
    description: "Response header policies",
  },
] as const;
export const REPORT_TYPES = [
  { value: "assessment", label: "Security assessment" },
  { value: "pentest", label: "Penetration test" },
  { value: "audit", label: "Security audit" },
  { value: "incident", label: "Incident response" },
  { value: "compliance", label: "Compliance report" },
];
export const SEVERITIES: Severity[] = [
  "critical",
  "high",
  "medium",
  "low",
  "info",
];
export function riskLevel(score: number): Severity {
  return score >= 75
    ? "critical"
    : score >= 50
      ? "high"
      : score >= 25
        ? "medium"
        : "low";
}
export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
export function timeAgo(value: string) {
  const minutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 60000),
  );
  return minutes < 1
    ? "Just now"
    : minutes < 60
      ? `${minutes}m ago`
      : minutes < 1440
        ? `${Math.floor(minutes / 60)}h ago`
        : `${Math.floor(minutes / 1440)}d ago`;
}
