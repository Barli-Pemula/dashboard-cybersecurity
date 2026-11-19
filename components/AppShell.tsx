"use client";
import { SessionProvider } from "next-auth/react";
import { WorkspaceProvider } from "@/components/WorkspaceProvider";
import ClientNotificationProvider from "@/components/ClientNotificationProvider";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import type { Access } from "@/lib/types";
export default function AppShell({
  access,
  children,
}: {
  access: Access;
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <WorkspaceProvider access={access}>
        <ClientNotificationProvider>
          <a href="#main-content" className="skip-link">
            Skip to content
          </a>
          <div className="app-shell">
            <Sidebar />
            <div className="app-body">
              <Header />
              <main id="main-content" className="main-content" tabIndex={-1}>
                {children}
              </main>
              <footer className="app-footer">
                <span>CyberSentinel security workspace</span>
                <span>
                  {access.demo
                    ? "Demo data · Stored in this browser"
                    : "Scans use simulated findings"}
                </span>
              </footer>
            </div>
          </div>
        </ClientNotificationProvider>
      </WorkspaceProvider>
    </SessionProvider>
  );
}
