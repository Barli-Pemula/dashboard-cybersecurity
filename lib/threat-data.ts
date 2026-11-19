// Simulated threat data generator for demo purposes
const THREAT_TYPES = [
  "Brute Force Attack",
  "SQL Injection Attempt",
  "XSS Attack",
  "DDoS Attack",
  "Port Scanning",
  "Malware Detection",
  "Phishing Attempt",
  "Ransomware Alert",
  "Data Exfiltration",
  "Zero-Day Exploit",
  "Man-in-the-Middle",
  "Privilege Escalation",
  "DNS Spoofing",
  "Buffer Overflow",
  "Credential Stuffing",
];

const SEVERITIES: string[] = ["critical", "high", "medium", "low", "info"];

const SOURCES = [
  "192.0.2.42",
  "192.0.2.156",
  "198.51.100.25",
  "198.51.100.194",
  "203.0.113.130",
  "203.0.113.10",
];

const TARGETS = [
  "Web Server (443)",
  "API Gateway (8080)",
  "Database (5432)",
  "Mail Server (25)",
  "DNS Server (53)",
  "SSH Service (22)",
  "FTP Service (21)",
  "Auth Service (3000)",
  "File Server (445)",
  "Proxy (3128)",
];

const COUNTRIES = [
  "Russia",
  "China",
  "North Korea",
  "Iran",
  "Brazil",
  "Romania",
  "India",
  "Ukraine",
  "Vietnam",
  "Indonesia",
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateThreatEvent() {
  const severity = randomItem(SEVERITIES);
  const type = randomItem(THREAT_TYPES);
  const country = randomItem(COUNTRIES);
  return {
    id: `threat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    severity,
    source: randomItem(SOURCES),
    target: randomItem(TARGETS),
    country,
    details: `Simulated ${type.toLowerCase()} event. The source, location, and target are example values.`,
    status:
      severity === "critical" || severity === "high" ? "active" : "monitored",
    timestamp: new Date().toISOString(),
  };
}

export function generateScanFindings(url: string, scanType = "full") {
  const findings = [];
  const possibleFindings = [
    {
      title: "Missing Content-Security-Policy Header",
      severity: "high",
      description:
        "The application does not set a Content-Security-Policy header, making it vulnerable to XSS attacks.",
      recommendation:
        "Add a strict CSP header to prevent unauthorized script execution.",
    },
    {
      title: "Outdated TLS Version Detected",
      severity: "critical",
      description:
        "The server supports TLS 1.0/1.1 which are known to have vulnerabilities.",
      recommendation: "Disable TLS 1.0 and 1.1. Use TLS 1.2 or 1.3 only.",
    },
    {
      title: "Open Port: 22 (SSH)",
      severity: "medium",
      description: "SSH port is accessible from the public internet.",
      recommendation:
        "Restrict SSH access to specific IP addresses using firewall rules.",
    },
    {
      title: "Missing X-Frame-Options Header",
      severity: "medium",
      description:
        "The application does not set X-Frame-Options, enabling clickjacking attacks.",
      recommendation: "Set X-Frame-Options to DENY or SAMEORIGIN.",
    },
    {
      title: "Server Information Disclosure",
      severity: "low",
      description:
        "Server response headers reveal software version information.",
      recommendation:
        "Remove or obfuscate server version headers (Server, X-Powered-By).",
    },
    {
      title: "Missing HSTS Header",
      severity: "high",
      description:
        "Strict-Transport-Security header is not set, allowing protocol downgrade attacks.",
      recommendation:
        "Add HSTS header with a minimum max-age of 31536000 seconds.",
    },
    {
      title: "Weak Cipher Suites Enabled",
      severity: "high",
      description:
        "The server supports weak cipher suites that could be exploited.",
      recommendation:
        "Disable weak ciphers (RC4, DES, 3DES) and use AES-256-GCM.",
    },
    {
      title: "Directory Listing Enabled",
      severity: "medium",
      description:
        "Web server directory listing is enabled, exposing file structures.",
      recommendation: "Disable directory listing in server configuration.",
    },
    {
      title: "Cookie Missing Secure Flag",
      severity: "medium",
      description: "Session cookies do not have the Secure flag set.",
      recommendation: "Set the Secure flag on all sensitive cookies.",
    },
    {
      title: "DNS Zone Transfer Available",
      severity: "info",
      description: "DNS zone transfer (AXFR) is available to any client.",
      recommendation:
        "Restrict zone transfers to authorized secondary DNS servers.",
    },
  ];

  // Repeatable simulation with checks selected by scan profile.
  const hash = Array.from(url).reduce(
    (total, char) => (total * 31 + char.charCodeAt(0)) >>> 0,
    7,
  );
  const candidates = possibleFindings.filter((finding) =>
    scanType === "ssl"
      ? /TLS|Cipher/.test(finding.title)
      : scanType === "headers"
        ? /Header|Disclosure/.test(finding.title)
        : true,
  );
  const ordered = candidates.map(
    (_, i) => candidates[(i + (hash % candidates.length)) % candidates.length],
  );
  const count =
    scanType === "quick"
      ? 2
      : scanType === "full"
        ? 3 + (hash % 3)
        : candidates.length;
  for (let i = 0; i < Math.min(count, ordered.length); i++) {
    findings.push({
      id: `finding-${Date.now()}-${i}`,
      ...ordered[i],
      url,
      detectedAt: new Date().toISOString(),
    });
  }

  return findings;
}

export function calculateRiskScore(
  findings: Array<{ severity: string }>,
): number {
  let score = 0;
  for (const f of findings) {
    switch (f.severity) {
      case "critical":
        score += 25;
        break;
      case "high":
        score += 15;
        break;
      case "medium":
        score += 8;
        break;
      case "low":
        score += 3;
        break;
      case "info":
        score += 1;
        break;
    }
  }
  return Math.min(score, 100);
}

export const SEVERITY_COLORS: Record<string, string> = {
  critical: "#ff073a",
  high: "#ff6700",
  medium: "#fbbf24",
  low: "#06b6d4",
  info: "#8b5cf6",
};

export const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};
