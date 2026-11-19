import Link from "next/link";
import Icon from "@/components/ui/Icon";
import type { Scan } from "@/lib/types";
export default function SecurityNews({ scans }: { scans: Scan[] }) {
  const all = scans.flatMap((scan) => scan.findings);
  const categories = [
    { label: "Critical", severity: "critical" },
    { label: "High", severity: "high" },
    { label: "Medium", severity: "medium" },
    { label: "Low / info", severity: "low" },
  ].map((item) => ({
    ...item,
    count: all.filter(
      (finding) =>
        finding.severity === item.severity ||
        (item.severity === "low" && finding.severity === "info"),
    ).length,
  }));
  return (
    <div className="card findings-card">
      <div className="section-heading">
        <h2>Finding breakdown</h2>
        <Icon name="shield" size={19} />
      </div>
      <div className="finding-total">
        <strong>{all.length}</strong>
        <span>across {scans.length} assessments</span>
      </div>
      <div className="severity-meter" aria-label="Findings by severity">
        {categories.map((item) => (
          <span
            key={item.severity}
            className={`meter-${item.severity}`}
            style={{ flexGrow: item.count || 0.05 }}
          />
        ))}
      </div>
      <div className="severity-list">
        {categories.map((item) => (
          <div key={item.label}>
            <span>
              <i className={`severity-dot ${item.severity}`} />
              {item.label}
            </span>
            <strong>{item.count.toString().padStart(2, "0")}</strong>
          </div>
        ))}
      </div>
      <Link href="/scanner" className="breakdown-link">
        Review scan findings
        <Icon name="chevron" size={16} />
      </Link>
    </div>
  );
}
