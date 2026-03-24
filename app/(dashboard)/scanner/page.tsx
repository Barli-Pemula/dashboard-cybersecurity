"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SeverityBadge from "@/components/ui/SeverityBadge";

interface Finding {
  id: string;
  title: string;
  severity: string;
  description: string;
  recommendation: string;
  url: string;
  detectedAt: string;
}

interface ScanResult {
  id: string;
  targetUrl: string;
  scanType: string;
  status: string;
  riskScore: number;
  findings: Finding[];
  startedAt: string;
  completedAt: string;
}

export default function ScannerPage() {
  const [url, setUrl] = useState("");
  const [scanType, setScanType] = useState("full");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [error, setError] = useState("");
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setScanning(true);
    setResult(null);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, scanType }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Scan failed");
        return;
      }
      setResult(data);
      setHistory((prev) => [data, ...prev]);
      setUrl("");
    } catch {
      setError("Unable to complete the scan. Please try again.");
    } finally {
      setScanning(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 75) return "text-red-600";
    if (score >= 50) return "text-orange-600";
    if (score >= 25) return "text-amber-600";
    return "text-green-600";
  };

  const getRiskLabel = (score: number) => {
    if (score >= 75) return "Critical";
    if (score >= 50) return "High";
    if (score >= 25) return "Medium";
    return "Low";
  };

  const getRiskBarColor = (score: number) => {
    if (score >= 75) return "bg-red-500";
    if (score >= 50) return "bg-orange-500";
    if (score >= 25) return "bg-amber-500";
    return "bg-green-500";
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-5 lg:mb-6">
        <h1 className="text-lg lg:text-xl font-semibold text-surface-800">
          What needs to be scanned?
        </h1>
        <p className="text-sm text-surface-400 mt-1">
          Enter a target URL to check for security vulnerabilities
        </p>
      </div>

      {/* Scan form */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-4 lg:p-5 mb-5"
      >
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleScan} className="flex flex-col md:flex-row gap-3">
          <input
            id="scan-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="input-mono flex-1"
            placeholder="https://example.com"
            required
          />
          <select
            id="scan-type"
            value={scanType}
            onChange={(e) => setScanType(e.target.value)}
            className="input w-full md:w-40"
          >
            <option value="full">Full Scan</option>
            <option value="quick">Quick Scan</option>
            <option value="ssl">SSL/TLS Only</option>
            <option value="headers">Headers Only</option>
          </select>
          <button
            id="start-scan"
            type="submit"
            disabled={scanning}
            className="btn-primary whitespace-nowrap"
          >
            {scanning ? "Processing..." : "Start scan"}
          </button>
        </form>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="card p-4 lg:p-5 mb-5"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-sm font-medium text-surface-700 mb-0.5">Scan results</p>
                <p className="text-xs text-surface-400 font-mono truncate max-w-[200px] lg:max-w-none">
                  {result.targetUrl}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${getRiskColor(result.riskScore)}`}>
                  {result.riskScore}
                </p>
                <p className="text-xs text-surface-400">
                  {getRiskLabel(result.riskScore)} risk
                </p>
              </div>
            </div>

            {/* Risk bar */}
            <div className="w-full bg-surface-100 rounded-full h-1.5 mb-5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${result.riskScore}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-1.5 rounded-full ${getRiskBarColor(result.riskScore)}`}
              />
            </div>

            {/* Findings */}
            <p className="text-sm font-medium text-surface-700 mb-3">
              {result.findings.length} findings
            </p>
            <div className="space-y-1">
              {result.findings
                .sort((a, b) => {
                  const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
                  return (order[a.severity] ?? 5) - (order[b.severity] ?? 5);
                })
                .map((finding) => (
                  <div
                    key={finding.id}
                    className="border border-surface-150 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setExpandedFinding(expandedFinding === finding.id ? null : finding.id)
                      }
                      className="w-full p-3 flex items-center justify-between hover:bg-surface-50 transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <SeverityBadge severity={finding.severity} />
                        <span className="text-sm text-surface-700 truncate">{finding.title}</span>
                      </div>
                      <svg
                        className={`w-4 h-4 text-surface-400 transition-transform shrink-0 ml-2 ${
                          expandedFinding === finding.id ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                    <AnimatePresence>
                      {expandedFinding === finding.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-surface-150"
                        >
                          <div className="p-4 space-y-3 bg-surface-50">
                            <div>
                              <p className="text-[11px] uppercase text-surface-400 font-semibold mb-1 tracking-wide">
                                Description
                              </p>
                              <p className="text-sm text-surface-600 leading-relaxed">
                                {finding.description}
                              </p>
                            </div>
                            <div>
                              <p className="text-[11px] uppercase text-surface-400 font-semibold mb-1 tracking-wide">
                                Recommendation
                              </p>
                              <p className="text-sm text-primary-700 font-mono break-words leading-relaxed">
                                {finding.recommendation}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scan History */}
      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card p-4 lg:p-5"
        >
          <p className="text-sm font-medium text-surface-700 mb-3">Recent scans</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-150">
                  <th className="text-left py-2 px-3 text-xs font-medium text-surface-400">Target</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-surface-400">Type</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-surface-400">Risk</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-surface-400">Findings</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-surface-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((scan) => (
                  <tr
                    key={scan.id}
                    className="border-b border-surface-100 hover:bg-surface-50 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono text-xs text-surface-600 truncate max-w-[180px]">
                      {scan.targetUrl}
                    </td>
                    <td className="py-2.5 px-3 text-xs text-surface-500 capitalize">
                      {scan.scanType}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`font-semibold text-xs ${getRiskColor(scan.riskScore)}`}>
                        {scan.riskScore}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-surface-500">
                      {scan.findings.length}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-green-50 text-green-700">
                        {scan.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
