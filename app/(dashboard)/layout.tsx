"use client";

import { useState } from "react";
import AuthProvider from "@/components/AuthProvider";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthProvider>
      <div className="flex min-h-screen bg-surface-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 w-full lg:ml-60 min-w-0">
          <Header onMenuToggle={() => setSidebarOpen((v) => !v)} />
          <main className="p-4 lg:p-6 max-w-6xl">{children}</main>
        </div>
      </div>
    </AuthProvider>
  );
}
