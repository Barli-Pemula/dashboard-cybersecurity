"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { loadWorkspace } from "@/lib/workspace";
import type { Access, Workspace } from "@/lib/types";
const AccessContext = createContext<Access | null>(null);
type WorkspaceState = Workspace & { loading: boolean; error: string; refresh: () => Promise<void> };
const DataContext = createContext<WorkspaceState | null>(null);
export function WorkspaceProvider({
  access,
  children,
}: {
  access: Access;
  children: React.ReactNode;
}) {
  const [data, setData] = useState<Workspace>({ scans: [], reports: [], threats: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    setError("");
    try { setData(await loadWorkspace(access.demo)); }
    catch (error) { setError(error instanceof Error ? error.message : "Unable to load workspace."); }
    finally { setLoading(false); }
  }, [access.demo]);
  useEffect(() => {
    refresh();
    window.addEventListener("workspace-updated", refresh);
    const sync = (event: StorageEvent) => { if (access.demo && event.key === "cybersentinel-demo-v1") refresh(); };
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("workspace-updated", refresh); window.removeEventListener("storage", sync); };
  }, [refresh, access.demo]);
  return (
    <AccessContext.Provider value={access}><DataContext.Provider value={{ ...data, loading, error, refresh }}>{children}</DataContext.Provider></AccessContext.Provider>
  );
}
export function useAccess() {
  const value = useContext(AccessContext);
  if (!value) throw new Error("Workspace provider is missing");
  return value;
}
export function useWorkspace() {
  const value = useContext(DataContext);
  if (!value) throw new Error("Workspace provider is missing");
  return value;
}
