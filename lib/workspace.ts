"use client";
import { createDemoWorkspace } from "@/lib/demo-data";
import type { Report, Scan, Workspace } from "@/lib/types";

const KEY = "cybersentinel-demo-v1";
export async function requestJSON<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(
      data.error ||
        (response.status === 401
          ? "Your session has expired. Sign in again."
          : "The request failed. Please try again."),
    );
  return data as T;
}
function persist(workspace: Workspace) {
  try {
    localStorage.setItem(KEY, JSON.stringify(workspace));
  } catch {
    throw new Error(
      "Demo storage is unavailable or full. Allow browser storage, or reset demo data.",
    );
  }
  window.dispatchEvent(new Event("workspace-updated"));
}
export function demoWorkspace(): Workspace {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) {
      const value = JSON.parse(saved);
      if (
        Array.isArray(value.scans) &&
        Array.isArray(value.reports) &&
        Array.isArray(value.threats)
      )
        return value;
    }
  } catch {
    /* Recover from an invalid or unavailable browser store. */
  }
  const initial = createDemoWorkspace();
  persist(initial);
  return initial;
}
export async function loadWorkspace(demo: boolean): Promise<Workspace> {
  if (demo) return demoWorkspace();
  const [scans, reports, threats] = await Promise.all([
    requestJSON<Workspace["scans"]>("/api/scan"),
    requestJSON<Workspace["reports"]>("/api/reports"),
    requestJSON<Workspace["threats"]>("/api/threats"),
  ]);
  return { scans, reports, threats };
}
export async function runScan(
  demo: boolean,
  url: string,
  scanType: string,
): Promise<Scan> {
  const scan = await requestJSON<Scan>("/api/scan", {
    method: "POST",
    body: JSON.stringify({ url, scanType }),
  });
  if (demo) {
    const value = demoWorkspace();
    value.scans = [scan, ...value.scans].slice(0, 50);
    persist(value);
  } else window.dispatchEvent(new Event("workspace-updated"));
  return scan;
}
export async function saveReport(
  demo: boolean,
  report: Pick<Report, "title" | "type" | "severity" | "summary"> & {
    findings?: Report["findings"];
  },
): Promise<Report> {
  const saved = await requestJSON<Report>("/api/reports", {
    method: "POST",
    body: JSON.stringify(report),
  });
  if (demo) {
    const value = demoWorkspace();
    value.reports = [saved, ...value.reports].slice(0, 50);
    persist(value);
  } else window.dispatchEvent(new Event("workspace-updated"));
  return saved;
}
export function resetDemoWorkspace() {
  persist(createDemoWorkspace());
}
export function downloadJSON(value: unknown, filename: string) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
