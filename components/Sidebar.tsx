"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAccess } from "@/components/WorkspaceProvider";
import Icon, { type IconName } from "@/components/ui/Icon";
import Modal from "@/components/ui/Modal";
export const navigation: {
  label: string;
  short: string;
  href: string;
  icon: IconName;
}[] = [
  {
    label: "Overview",
    short: "Overview",
    href: "/dashboard",
    icon: "overview",
  },
  {
    label: "Vulnerability scanner",
    short: "Scanner",
    href: "/scanner",
    icon: "scan",
  },
  {
    label: "Security reports",
    short: "Reports",
    href: "/reports",
    icon: "reports",
  },
];
export function Brand({ href = "/dashboard" }: { href?: string }) {
  return (
    <Link className="brand" href={href}>
      <span className="brand-mark">
        <Icon name="shield" size={21} />
      </span>
      <span>
        CyberSentinel<span className="brand-subtitle">Security workspace</span>
      </span>
    </Link>
  );
}
export default function Sidebar() {
  const pathname = usePathname();
  const { demo } = useAccess();
  const [help, setHelp] = useState(false);
  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Brand />
        </div>
        <div className="workspace-label">
          <span className="workspace-initial">{demo ? "D" : "P"}</span>
          <div>
            {demo ? "Demo workspace" : "Personal workspace"}
            <small>
              {demo ? "Browser-local environment" : "Analyst environment"}
            </small>
          </div>
        </div>
        <div className="nav-label">Workspace</div>
        <nav aria-label="Main navigation" className="sidebar-nav">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {pathname === item.href && <span className="nav-active-marker" />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <Icon name={demo ? "info" : "shield"} size={22} />
            <h3>{demo ? "A space to explore" : "Your security workflow"}</h3>
            <p>
              {demo
                ? "Try a scan, inspect findings, and build your first report."
                : "Review findings and keep assessment records in one place."}
            </p>
            <Link href="/scanner">
              Start a scan
              <Icon name="chevron" size={16} />
            </Link>
          </div>
          <button className="sidebar-help" onClick={() => setHelp(true)}>
            <Icon name="book" size={18} />
            Workspace guide
          </button>
          <div className="sidebar-footer">
            <span>CyberSentinel</span>
            <span>v1.1</span>
          </div>
        </div>
      </aside>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={pathname === item.href ? "page" : undefined}
          >
            <Icon name={item.icon} />
            <span>{item.short}</span>
          </Link>
        ))}
      </nav>
      {help && (
        <Modal title="Workspace guide" onClose={() => setHelp(false)}>
          <div className="guide-content">
            <p>
              Use Overview to review event activity and open findings. The
              displayed totals are calculated from the records in your
              workspace.
            </p>
            <h3>Run a simulated assessment</h3>
            <p>
              Open Scanner, enter a public URL, and select a profile. Findings
              are generated examples. No request is sent to the target.
            </p>
            <h3>Document the findings</h3>
            <p>
              Create a report from a scan, or write one in Reports. Open any
              report to read its summary and download its JSON file.
            </p>
            <h3>About the demo</h3>
            <p>
              The demo account lasts eight hours. Its records are stored in this
              browser, separate from real account data. Reset demo data from the
              account menu to start over.
            </p>
          </div>
        </Modal>
      )}
    </>
  );
}
