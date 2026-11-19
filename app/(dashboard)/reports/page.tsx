"use client";
import { useState } from "react";
import { useAccess, useWorkspace } from "@/components/WorkspaceProvider";
import { useNotifications } from "@/context/NotificationContext";
import { saveReport, downloadJSON } from "@/lib/workspace";
import { REPORT_TYPES, SEVERITIES, formatDate, type Report } from "@/lib/types";
import Icon from "@/components/ui/Icon";
import Modal from "@/components/ui/Modal";
import SeverityBadge from "@/components/ui/SeverityBadge";
import {
  EmptyState,
  ErrorMessage,
  LoadingState,
} from "@/components/ui/Feedback";
export default function ReportsPage() {
  const { demo } = useAccess();
  const { reports, loading, error: loadError, refresh } = useWorkspace();
  const { showToast } = useNotifications();
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Report | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("assessment");
  const [severity, setSeverity] = useState("medium");
  const [summary, setSummary] = useState("");
  const filtered = reports.filter(
    (report) =>
      (status === "all" || report.status === status) &&
      `${report.title} ${report.summary} ${report.type}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const typeLabel = (value: string) =>
    REPORT_TYPES.find((item) => item.value === value)?.label || value;
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!title.trim() || !summary.trim()) {
      setError("Add a title and summary before saving your report.");
      return;
    }
    setSaving(true);
    try {
      await saveReport(demo, {
        title: title.trim(),
        type,
        severity,
        summary: summary.trim(),
      });
      setShowForm(false);
      setTitle("");
      setSummary("");
      setType("assessment");
      setSeverity("medium");
      showToast({
        type: "success",
        title: "Report saved",
        message: "Your new draft is available in the report library.",
      });
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="page-enter">
      <div className="page-heading">
        <div>
          <div className="page-eyebrow">Assessment documentation</div>
          <h1>Security reports</h1>
          <p>Keep your findings, context, and recommended actions together.</p>
        </div>
        <div className="page-actions">
          <button
            className="btn-secondary"
            disabled={!filtered.length || loading || !!loadError}
            onClick={() =>
              downloadJSON(
                {
                  exportedAt: new Date().toISOString(),
                  demo,
                  reports: filtered,
                },
                "cybersentinel-reports.json",
              )
            }
          >
            <Icon name="download" size={17} />
            Export reports
          </button>
          <button
            id="generate-report"
            className="btn-primary"
            onClick={() => {
              setError("");
              setShowForm(true);
            }}
          >
            <Icon name="plus" size={18} />
            New report
          </button>
        </div>
      </div>
      <div className="report-summary">
        <div>
          <span className="report-summary-icon">
            <Icon name="reports" size={22} />
          </span>
          <strong>{reports.length.toString().padStart(2, "0")}</strong>
          <span>Total reports</span>
        </div>
        {["draft", "review", "published"].map((value) => (
          <div key={value}>
            <span className={`report-status-dot ${value}`} />
            <strong>
              {reports
                .filter((report) => report.status === value)
                .length.toString()
                .padStart(2, "0")}
            </strong>
            <span>
              {value === "review"
                ? "In review"
                : value === "draft"
                  ? "Drafts"
                  : "Published"}
            </span>
          </div>
        ))}
      </div>
      <section className="card report-library">
        <div className="events-heading">
          <div>
            <h2>Report library</h2>
            <p>
              {demo
                ? "Example reports and your browser-local drafts"
                : "Assessment records for your account"}
            </p>
          </div>
          <span className="subtle-label">Latest first</span>
        </div>
        <div className="table-toolbar">
          <div className="search-field">
            <Icon name="search" size={18} />
            <label className="sr-only" htmlFor="report-search">
              Search reports
            </label>
            <input
              id="report-search"
              placeholder="Search reports…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="report-filter">
            <label className="sr-only" htmlFor="report-status">
              Filter report status
            </label>
            <select
              className="input"
              id="report-status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="review">In review</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
        {loadError && <ErrorMessage message={loadError} retry={refresh} />}
        {loading ? (
          <LoadingState label="Loading reports" />
        ) : filtered.length ? (
          <div className="report-list">
            <div className="report-table-head">
              <span>Report name</span>
              <span>Severity</span>
              <span>Status</span>
              <span>Created</span>
              <span />
            </div>
            {filtered.map((report) => (
              <div className="report-row" key={report.id}>
                <button
                  className="report-open"
                  onClick={() => setSelected(report)}
                  aria-label={`Open ${report.title}`}
                >
                  <span className="report-document">
                    <Icon name="reports" size={21} />
                  </span>
                  <span>
                    <strong>{report.title}</strong>
                    <small>{typeLabel(report.type)}</small>
                  </span>
                </button>
                <SeverityBadge severity={report.severity} />
                <span className={`status-badge ${report.status}`}>
                  {report.status === "review" ? "In review" : report.status}
                </span>
                <span className="report-date">
                  {formatDate(report.createdAt)}
                </span>
                <button
                  className="icon-button report-download"
                  aria-label={`Download ${report.title}`}
                  onClick={() =>
                    downloadJSON(
                      { ...report, demo, simulatedFindings: true },
                      `report-${report.id}.json`,
                    )
                  }
                >
                  <Icon name="download" size={18} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          !loadError && (
            <EmptyState
              title={
                query || status !== "all"
                  ? "No matching reports"
                  : "Make your findings useful"
              }
              description={
                query || status !== "all"
                  ? "Try another search or select a different status."
                  : "Create a report to document an assessment, or generate one directly from a scan."
              }
            >
              {!query && status === "all" && (
                <button
                  className="btn-primary"
                  onClick={() => setShowForm(true)}
                >
                  Create your first report
                </button>
              )}
            </EmptyState>
          )
        )}
        <div className="library-footer">
          <Icon name="info" size={15} />
          <span>
            {demo
              ? "Demo reports are saved only in this browser. Export a copy to keep it."
              : "Export reports as JSON, including any attached findings."}
          </span>
        </div>
      </section>
      {showForm && (
        <Modal
          title="Create security report"
          onClose={() => {
            if (!saving) setShowForm(false);
          }}
        >
          <form className="report-form" onSubmit={submit}>
            <p className="muted">
              Document the scope, key findings, and next actions.
            </p>
            <div className="field">
              <label htmlFor="report-title">Report title</label>
              <input
                id="report-title"
                className="input"
                autoFocus
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Customer portal security assessment"
                required
                maxLength={160}
                disabled={saving}
              />
            </div>
            <div className="form-columns">
              <div className="field">
                <label htmlFor="report-type">Report type</label>
                <select
                  id="report-type"
                  className="input"
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                  disabled={saving}
                >
                  {REPORT_TYPES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="report-severity">Overall severity</label>
                <select
                  id="report-severity"
                  className="input"
                  value={severity}
                  onChange={(event) => setSeverity(event.target.value)}
                  disabled={saving}
                >
                  {SEVERITIES.map((value) => (
                    <option key={value} value={value}>
                      {value[0].toUpperCase() + value.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field">
              <label htmlFor="report-summary">Summary and next actions</label>
              <textarea
                id="report-summary"
                className="input"
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                placeholder="Describe what you reviewed, what needs attention, and who should act."
                rows={5}
                required
                maxLength={10000}
                disabled={saving}
              />
            </div>
            {error && <ErrorMessage message={error} />}
            <p className="field-hint">
              Your report will be saved as a draft
              {demo ? " in this browser" : " in your account"}.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowForm(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Saving draft…" : "Save report"}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {selected && (
        <Modal title="Security report" onClose={() => setSelected(null)}>
          <div className="report-detail">
            <div className="report-detail-labels">
              <SeverityBadge severity={selected.severity} />
              <span className={`status-badge ${selected.status}`}>
                {selected.status === "review" ? "In review" : selected.status}
              </span>
            </div>
            <h3>{selected.title}</h3>
            <p className="muted">
              {typeLabel(selected.type)} · {formatDate(selected.createdAt)}
            </p>
            <h4>Summary</h4>
            <p className="report-summary-text">{selected.summary}</p>
            {selected.findings?.length > 0 && (
              <>
                <h4>Attached findings ({selected.findings.length})</h4>
                <div className="findings-accordion">
                  {selected.findings.map((finding) => (
                    <details key={finding.id}>
                      <summary>
                        <SeverityBadge severity={finding.severity} />
                        <span>{finding.title}</span>
                        <Icon name="down" size={16} />
                      </summary>
                      <div className="finding-content">
                        <p>{finding.description}</p>
                        <h4>Recommended action</h4>
                        <p>{finding.recommendation}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </>
            )}
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setSelected(null)}
              >
                Close report
              </button>
              <button
                className="btn-primary"
                onClick={() =>
                  downloadJSON(
                    { ...selected, demo, simulatedFindings: true },
                    `report-${selected.id}.json`,
                  )
                }
              >
                <Icon name="download" size={17} />
                Download JSON
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
