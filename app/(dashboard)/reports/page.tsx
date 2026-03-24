"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Report {
  id: string;
  title: string;
  type: string;
  status: string;
  severity: string;
  summary: string;
  createdAt: string;
}

const REPORT_TYPES = [
  { value: "assessment", label: "Security Assessment" },
  { value: "pentest", label: "Penetration Test" },
  { value: "audit", label: "Security Audit" },
  { value: "incident", label: "Incident Response" },
  { value: "compliance", label: "Compliance Report" },
];

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-surface-100 text-surface-500",
  review: "bg-amber-50 text-amber-700",
  published: "bg-green-50 text-green-700",
};

const SEVERITY_STYLES: Record<string, string> = {
  critical: "bg-red-50 text-red-700",
  high: "bg-orange-50 text-orange-700",
  medium: "bg-amber-50 text-amber-700",
  low: "bg-blue-50 text-blue-700",
  info: "bg-violet-50 text-violet-700",
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("assessment");
  const [severity, setSeverity] = useState("medium");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/reports");
      if (res.ok) setReports(await res.json());
    } catch (e) {
      console.error("Failed to fetch reports:", e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, type, severity, summary }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create report"); return; }
      setReports((prev) => [data, ...prev]);
      setShowForm(false);
      setTitle(""); setType("assessment"); setSeverity("medium"); setSummary("");
    } catch { setError("An unexpected error occurred"); }
    finally { setLoading(false); }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 lg:mb-6">
        <div>
          <h1 className="text-lg lg:text-xl font-semibold text-surface-800">
            Security reports
          </h1>
          <p className="text-sm text-surface-400 mt-1">
            Create and manage assessment documentation
          </p>
        </div>
        <button
          id="generate-report"
          onClick={() => setShowForm(!showForm)}
          className={showForm ? "btn-secondary shrink-0" : "btn-primary shrink-0"}
        >
          {showForm ? "Cancel" : "New report"}
        </button>
      </div>

      {/* Report form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-5"
          >
            <div className="card p-4 lg:p-5">
              <p className="text-sm font-medium text-surface-700 mb-4">New report</p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-surface-500 mb-1.5">Title</label>
                    <input
                      id="report-title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="input"
                      placeholder="Q1 2024 Security Assessment"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-surface-500 mb-1.5">Type</label>
                    <select
                      id="report-type"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="input"
                    >
                      {REPORT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-surface-500 mb-1.5">Severity</label>
                  <div className="flex flex-wrap gap-2">
                    {["critical", "high", "medium", "low", "info"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSeverity(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all border ${
                          severity === s
                            ? SEVERITY_STYLES[s] + " border-transparent ring-2 ring-primary-200"
                            : "bg-white text-surface-500 border-surface-200 hover:border-surface-300"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-surface-500 mb-1.5">Summary</label>
                  <textarea
                    id="report-summary"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="input min-h-[100px] resize-y"
                    placeholder="Describe the key findings and assessment scope..."
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? "Creating..." : "Create report"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reports grid or empty state */}
      {reports.length === 0 && !showForm ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card p-8 lg:p-12 text-center"
        >
          <div className="w-12 h-12 mx-auto bg-surface-100 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-surface-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-surface-700 mb-1">No reports yet</p>
          <p className="text-sm text-surface-400 mb-4">
            Start by creating your first assessment report
          </p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            New report
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          {reports.map((report, i) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card-hover p-4 lg:p-5 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                  STATUS_STYLES[report.status] || STATUS_STYLES.draft
                }`}>
                  {report.status.toUpperCase()}
                </span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                  SEVERITY_STYLES[report.severity] || SEVERITY_STYLES.info
                }`}>
                  {report.severity.toUpperCase()}
                </span>
              </div>
              <h3 className="text-sm font-medium text-surface-800 mb-2 line-clamp-2">
                {report.title}
              </h3>
              <p className="text-xs text-surface-400 mb-3 line-clamp-2 leading-relaxed">
                {report.summary}
              </p>
              <div className="divider mb-2.5" />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-surface-400 capitalize">{report.type}</span>
                <span className="text-[11px] text-surface-400">{formatDate(report.createdAt)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
