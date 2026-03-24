"use client";

import { useEffect, useState } from "react";

interface NewsItem {
  id: string;
  title: string;
  source: string;
  severity: string;
  date: string;
}

const MOCK_NEWS: NewsItem[] = [
  { id: "1", title: "Critical zero-day vulnerability found in popular CMS platform", source: "CVE Database", severity: "critical", date: "2h ago" },
  { id: "2", title: "New ransomware variant targets healthcare sector organizations", source: "CISA Advisory", severity: "high", date: "4h ago" },
  { id: "3", title: "APT group launches coordinated supply chain attacks", source: "Threat Intel", severity: "high", date: "6h ago" },
  { id: "4", title: "Browser extension malware affects 500K+ users worldwide", source: "Security Weekly", severity: "medium", date: "8h ago" },
  { id: "5", title: "Updated NIST cybersecurity framework guidelines released", source: "NIST", severity: "info", date: "12h ago" },
  { id: "6", title: "Major cloud provider patches authentication bypass vulnerability", source: "BugBounty", severity: "critical", date: "1d ago" },
];

const severityDot: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-amber-500",
  low: "bg-blue-500",
  info: "bg-violet-500",
};

export default function SecurityNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  useEffect(() => setNews(MOCK_NEWS), []);

  return (
    <div className="card p-4 lg:p-5">
      <p className="text-sm font-medium text-surface-700 mb-4">Security advisories</p>
      <div className="space-y-0">
        {news.map((item, i) => (
          <div key={item.id}>
            {i > 0 && <div className="divider" />}
            <div className="py-2.5 flex items-start gap-2.5 group cursor-pointer">
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${
                  severityDot[item.severity] || "bg-surface-400"
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-surface-600 leading-snug group-hover:text-surface-800 transition-colors line-clamp-2">
                  {item.title}
                </p>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-surface-400">
                  <span>{item.source}</span>
                  <span>·</span>
                  <span>{item.date}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
