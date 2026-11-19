"use client";
import { useState } from "react";
import Link from "next/link";
import { useAccess, useWorkspace } from "@/components/WorkspaceProvider";
import StatsCard from "@/components/ui/StatsCard";
import ThreatChart from "@/components/ui/ThreatChart";
import ThreatFeed from "@/components/dashboard/ThreatFeed";
import SecurityNews from "@/components/dashboard/SecurityNews";
import Icon from "@/components/ui/Icon";
import { ErrorMessage, LoadingState } from "@/components/ui/Feedback";
import { downloadJSON } from "@/lib/workspace";
export default function DashboardPage() {
  const { demo } = useAccess();
  const { scans, reports, threats, loading, error, refresh } = useWorkspace();
  const [hours, setHours] = useState(24);
  const selected = threats.filter(
    (threat) =>
      Date.now() - new Date(threat.timestamp).getTime() <= hours * 3600000,
  );
  const active = selected.filter((threat) => threat.status === "active").length;
  const findings = scans.flatMap((scan) => scan.findings);
  const critical = findings.filter(
    (finding) => finding.severity === "critical" || finding.severity === "high",
  ).length;
  const average = scans.length
    ? Math.round(
        scans.reduce((sum, scan) => sum + scan.riskScore, 0) / scans.length,
      )
    : null;
  return (
    <div className="page-enter">
      <div className="page-heading">
        <div>
          <div className="page-eyebrow">Security operations</div>
          <h1>Security overview</h1>
          <p>A clear view of your events, assessments, and findings.</p>
        </div>
        <div className="page-actions">
          <label className="period-select">
            <Icon name="calendar" size={17} />
            <span className="sr-only">Event time range</span>
            <select
              value={hours}
              onChange={(event) => setHours(Number(event.target.value))}
            >
              <option value={24}>Last 24 hours</option>
              <option value={12}>Last 12 hours</option>
              <option value={6}>Last 6 hours</option>
            </select>
          </label>
          <button
            className="btn-secondary"
            disabled={loading || !!error}
            onClick={() =>
              downloadJSON(
                {
                  exportedAt: new Date().toISOString(),
                  demo,
                  scans,
                  reports,
                  threats: selected,
                },
                "cybersentinel-overview.json",
              )
            }
          >
            <Icon name="download" size={17} />
            Export overview
          </button>
        </div>
      </div>
      {demo && (
        <div className="workspace-banner">
          <span className="banner-icon">
            <Icon name="shield" size={24} />
          </span>
          <div>
            <strong>Your demo workspace is ready.</strong>
            <p>
              Explore example events and try a simulated security assessment.
            </p>
          </div>
          <Link href="/scanner" className="banner-link">
            Run your first scan
            <Icon name="chevron" size={16} />
          </Link>
        </div>
      )}
      {error && <ErrorMessage message={error} retry={refresh} />}
      {loading ? (
        <LoadingState />
      ) : (
        !error && (
          <>
            <div className="stats-grid">
              <StatsCard
                title="Active events"
                value={active.toString().padStart(2, "0")}
                detail={`${selected.length} events in this period`}
                icon="activity"
                tone={active ? "danger" : "neutral"}
              />
              <StatsCard
                title="Completed scans"
                value={scans
                  .filter((scan) => scan.status === "completed")
                  .length.toString()
                  .padStart(2, "0")}
                detail="In your scan history"
                icon="scan"
              />
              <StatsCard
                title="Priority findings"
                value={critical.toString().padStart(2, "0")}
                detail="Critical and high severity"
                icon="alert"
                tone={critical ? "danger" : "neutral"}
              />
              <StatsCard
                title="Average risk score"
                value={average === null ? "N/A" : `${average}`}
                detail={
                  average === null
                    ? "Run a scan to calculate"
                    : "Out of 100 · Across all scans"
                }
                icon="shield"
              />
            </div>
            <div className="dashboard-charts">
              <ThreatChart threats={selected} hours={hours} />
              <SecurityNews scans={scans} />
            </div>
            <ThreatFeed threats={selected} demo={demo} />
            <div className="workflow-strip">
              <div>
                <span className="workflow-icon">
                  <Icon name="reports" size={22} />
                </span>
                <div>
                  <strong>Turn findings into a clear report.</strong>
                  <p>
                    {reports.length}{" "}
                    {reports.length === 1 ? "report" : "reports"} in your
                    workspace. Document your next assessment.
                  </p>
                </div>
              </div>
              <Link href="/reports" className="btn-secondary">
                View security reports
              </Link>
            </div>
          </>
        )
      )}
    </div>
  );
}
