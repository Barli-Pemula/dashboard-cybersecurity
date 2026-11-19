"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { timeAgo } from "@/lib/types";
import Icon from "@/components/ui/Icon";
export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { scans, reports, loading, error, refresh } = useWorkspace();
  const activities = [
    ...scans.map((scan) => ({
      id: scan.id,
      title: `Scan completed: ${new URL(scan.targetUrl).hostname}`,
      date: scan.startedAt,
      href: "/scanner",
      icon: "scan" as const,
    })),
    ...reports.map((report) => ({
      id: report.id,
      title: report.title,
      date: report.createdAt,
      href: "/reports",
      icon: "reports" as const,
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  return (
    <div className="activity-wrapper" ref={ref}>
      <button
        className="icon-button"
        onClick={() => setOpen(!open)}
        aria-label="Activity history"
        aria-expanded={open}
        aria-controls="activity-panel"
      >
        <Icon name="bell" />
      </button>
      {open && (
        <div className="activity-panel" id="activity-panel">
          <div className="activity-heading">
            <div>
              <h2>Workspace activity</h2>
              <p>Recent scans and reports</p>
            </div>
            <button
              className="icon-button"
              aria-label="Close activity"
              onClick={() => setOpen(false)}
            >
              <Icon name="close" size={18} />
            </button>
          </div>
          {loading ? (
            <p className="panel-note">Loading activity…</p>
          ) : error ? (
            <div className="panel-note">
              <p>{error}</p>
              <button className="text-link" onClick={refresh}>
                Try again
              </button>
            </div>
          ) : !activities.length ? (
            <p className="panel-note">
              Your scans and reports will appear here.
            </p>
          ) : (
            <div className="activity-list">
              {activities.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setOpen(false)}
                >
                  <span className="activity-icon">
                    <Icon name={item.icon} size={18} />
                  </span>
                  <span>
                    {item.title}
                    <small>{timeAgo(item.date)}</small>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
