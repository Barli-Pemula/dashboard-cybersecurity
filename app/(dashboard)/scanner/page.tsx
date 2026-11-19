"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccess, useWorkspace } from "@/components/WorkspaceProvider";
import { useNotifications } from "@/context/NotificationContext";
import { runScan, saveReport, downloadJSON } from "@/lib/workspace";
import { SCAN_TYPES, formatDate, riskLevel, type Scan } from "@/lib/types";
import { SEVERITY_ORDER } from "@/lib/threat-data";
import Icon from "@/components/ui/Icon";
import SeverityBadge from "@/components/ui/SeverityBadge";
import {
  EmptyState,
  ErrorMessage,
  LoadingState,
} from "@/components/ui/Feedback";
export default function ScannerPage() {
  const { demo } = useAccess();
  const { scans, loading, error: loadError, refresh } = useWorkspace();
  const { showToast } = useNotifications();
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [scanType, setScanType] = useState("full");
  const [scanning, setScanning] = useState(false);
  const [creatingReport, setCreatingReport] = useState(false);
  const [result, setResult] = useState<Scan | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (result) {
      const section = document.getElementById("scan-results");
      section?.focus({ preventScroll: true });
      section?.scrollIntoView({ block: "start" });
    }
  }, [result]);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setScanning(true);
    try {
      const scan = await runScan(demo, url.trim(), scanType);
      setResult(scan);
      showToast({
        type: "success",
        title: "Assessment complete",
        message: `${scan.findings.length} simulated findings are ready to review.`,
      });
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setScanning(false);
    }
  }
  async function createReport() {
    if (!result) return;
    setCreatingReport(true);
    try {
      await saveReport(demo, {
        title: `Assessment: ${new URL(result.targetUrl).hostname}`,
        type: "assessment",
        severity: riskLevel(result.riskScore),
        summary: `Simulated ${SCAN_TYPES.find((item) => item.value === result.scanType)?.label || result.scanType} for ${result.targetUrl}. Risk score: ${result.riskScore}/100. ${result.findings.length} illustrative findings are attached. This assessment does not verify the security of the target.`,
        findings: result.findings,
      });
      showToast({
        type: "success",
        title: "Report created",
        message: "Your assessment and findings have been saved as a draft.",
      });
      router.push("/reports");
    } catch (error) {
      showToast({
        type: "error",
        title: "Unable to create report",
        message: (error as Error).message,
      });
    } finally {
      setCreatingReport(false);
    }
  }
  return (
    <div className="page-enter">
      <div className="page-heading">
        <div>
          <div className="page-eyebrow">Assessment tools</div>
          <h1>Vulnerability scanner</h1>
          <p>Run an assessment and turn the findings into a plan.</p>
        </div>
        <span className="simulation-label">
          <Icon name="info" size={16} />
          Simulation environment
        </span>
      </div>
      <div className="scanner-intro">
        <div className="card scanner-form-card">
          <div className="section-heading">
            <h2>New assessment</h2>
            <span className="subtle-label">URL scanner</span>
          </div>
          <p className="muted">
            Choose a target and the checks you want to explore.
          </p>
          <form onSubmit={submit} className="scan-form">
            <div className="field">
              <label htmlFor="scan-url">Target URL</label>
              <div className="input-with-icon">
                <Icon name="globe" size={19} />
                <input
                  id="scan-url"
                  className="input"
                  type="url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://your-domain.com"
                  required
                  maxLength={2048}
                  aria-describedby="url-help scan-error"
                  aria-invalid={!!error}
                  disabled={scanning}
                />
              </div>
              <p id="url-help" className="field-hint">
                A public HTTP or HTTPS address. Private hosts are excluded.
              </p>
            </div>
            <fieldset className="scan-profiles">
              <legend>Assessment profile</legend>
              {SCAN_TYPES.map((type) => (
                <label
                  key={type.value}
                  className={`profile-option ${scanType === type.value ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="scanType"
                    value={type.value}
                    checked={scanType === type.value}
                    onChange={() => setScanType(type.value)}
                    disabled={scanning}
                  />
                  <span>
                    <strong>{type.label}</strong>
                    <small>{type.description}</small>
                  </span>
                  <span className="radio-indicator" />
                </label>
              ))}
            </fieldset>
            <div id="scan-error">
              {error && <ErrorMessage message={error} />}
            </div>
            <button
              id="start-scan"
              type="submit"
              className="btn-primary"
              disabled={scanning}
            >
              {scanning ? (
                <span className="loading-spinner" />
              ) : (
                <Icon name="scan" size={18} />
              )}
              {scanning ? "Running assessment…" : "Start assessment"}
            </button>
          </form>
        </div>
        <aside className="scanner-explainer">
          <span className="explainer-icon">
            <Icon name="shield" size={30} />
          </span>
          <h2>Understand your next step.</h2>
          <p>
            Explore how a security assessment groups findings, estimates risk,
            and recommends a response.
          </p>
          <ul>
            <li>
              <Icon name="check" size={17} />
              Profile-specific findings
            </li>
            <li>
              <Icon name="check" size={17} />
              Severity and remediation guidance
            </li>
            <li>
              <Icon name="check" size={17} />
              Exportable assessment records
            </li>
          </ul>
          <div className="simulation-note">
            <Icon name="info" size={18} />
            <p>
              This scanner generates simulated findings. It does not send
              traffic to the target or test a live system.
            </p>
          </div>
          <button
            className="text-link"
            onClick={() => {
              setUrl("https://portal.example.com");
              document.getElementById("scan-url")?.focus();
            }}
          >
            Use an example target
          </button>
        </aside>
      </div>
      {result && (
        <section className="card scan-results" id="scan-results" tabIndex={-1} aria-label="Assessment results">
          <div className="results-heading">
            <div>
              <span className="completed-label">
                <Icon name="check" size={15} />
                Assessment completed
              </span>
              <h2>Assessment findings</h2>
              <p className="mono break-anywhere">{result.targetUrl}</p>
            </div>
            <div className="risk-score">
              <strong className={`risk-${riskLevel(result.riskScore)}`}>
                {result.riskScore}
                <span>/100</span>
              </strong>
              <span className="capitalize">
                {riskLevel(result.riskScore)} simulated risk
              </span>
            </div>
          </div>
          <div className={`risk-track risk-${riskLevel(result.riskScore)}`}>
            <span style={{ width: `${result.riskScore}%` }} />
          </div>
          <div className="findings-heading">
            <h3>{result.findings.length} findings to review</h3>
            <span>Highest severity first</span>
          </div>
          <div className="findings-accordion">
            {[...result.findings]
              .sort(
                (a, b) =>
                  (SEVERITY_ORDER[a.severity] ?? 5) -
                  (SEVERITY_ORDER[b.severity] ?? 5),
              )
              .map((finding) => (
                <details key={finding.id}>
                  <summary>
                    <SeverityBadge severity={finding.severity} />
                    <span>{finding.title}</span>
                    <Icon name="down" size={17} />
                  </summary>
                  <div className="finding-content">
                    <p>{finding.description}</p>
                    <h4>Recommended action</h4>
                    <p>{finding.recommendation}</p>
                  </div>
                </details>
              ))}
          </div>
          <div className="result-actions">
            <span className="muted">
              Illustrative findings, for demonstration only.
            </span>
            <div>
              <button
                className="btn-secondary"
                onClick={() =>
                  downloadJSON(
                    { ...result, simulated: true },
                    `scan-${result.id}.json`,
                  )
                }
              >
                <Icon name="download" size={17} />
                Export results
              </button>
              <button
                className="btn-primary"
                disabled={creatingReport}
                onClick={createReport}
              >
                <Icon name="reports" size={17} />
                {creatingReport ? "Creating report…" : "Create report"}
              </button>
            </div>
          </div>
        </section>
      )}
      <section className="card scan-history">
        <div className="events-heading">
          <div>
            <h2>Assessment history</h2>
            <p>
              {demo
                ? "Saved in this browser, including your example scans"
                : "Your recent assessment records"}
            </p>
          </div>
          <span className="count-label">{scans.length} scans</span>
        </div>
        {loadError && <ErrorMessage message={loadError} retry={refresh} />}
        {loading ? (
          <LoadingState label="Loading assessment history" />
        ) : scans.length ? (
          <div className="scan-history-list">
            <div className="scan-history-head">
              <span>Target</span>
              <span>Profile</span>
              <span>Risk score</span>
              <span>Findings</span>
              <span>Date</span>
              <span />
            </div>
            {scans.map((scan) => (
              <button
                className={`scan-history-row ${result?.id === scan.id ? "selected" : ""}`}
                key={scan.id}
                onClick={() => {
                  setResult(scan);
                  setError("");
                }}
                aria-label={`Review scan of ${scan.targetUrl}`}
              >
                <span className="history-target">
                  <Icon name="globe" size={18} />
                  <span>
                    {new URL(scan.targetUrl).hostname}
                    <small>{scan.status}</small>
                  </span>
                </span>
                <span className="history-profile">
                  {SCAN_TYPES.find((type) => type.value === scan.scanType)
                    ?.label || scan.scanType}
                </span>
                <span>
                  <strong className={`risk-${riskLevel(scan.riskScore)}`}>
                    {scan.riskScore}
                  </strong>
                  <small className="muted"> / 100</small>
                </span>
                <span className="history-findings">
                  {scan.findings.length} findings
                </span>
                <span className="history-date">
                  {formatDate(scan.startedAt)}
                </span>
                <Icon name="chevron" size={16} />
              </button>
            ))}
          </div>
        ) : (
          !loadError && (
            <EmptyState
              title="Your first assessment starts here"
              description="Enter a target above and run a simulated assessment. You can return to its findings here."
            />
          )
        )}
      </section>
    </div>
  );
}
