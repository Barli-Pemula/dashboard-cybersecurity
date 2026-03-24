"use client";

import dynamic from "next/dynamic";
import StatsCard from "@/components/ui/StatsCard";
import { motion } from "framer-motion";

const ThreatChart = dynamic(() => import("@/components/ui/ThreatChart"), {
  ssr: false,
  loading: () => <div className="card p-5"><div className="shimmer h-[220px] w-full" /></div>,
});
const ThreatFeed = dynamic(() => import("@/components/dashboard/ThreatFeed"), {
  ssr: false,
  loading: () => <div className="card p-5"><div className="shimmer h-[280px] w-full" /></div>,
});
const SecurityNews = dynamic(() => import("@/components/dashboard/SecurityNews"), {
  ssr: false,
  loading: () => <div className="card p-5"><div className="shimmer h-[220px] w-full" /></div>,
});

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

export default function DashboardPage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {/* Page header */}
      <div className="mb-5 lg:mb-6">
        <h1 className="text-lg lg:text-xl font-semibold text-surface-800">
          What&apos;s happening today
        </h1>
        <p className="text-sm text-surface-400 mt-1">
          Real-time security posture overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-5 lg:mb-6">
        <StatsCard title="Active Threats" value="247" change="+12%" changeType="negative" icon={null} />
        <StatsCard title="Scans Completed" value="1,834" change="+8%" changeType="positive" icon={null} />
        <StatsCard title="Vulnerabilities" value="42" change="-5%" changeType="positive" icon={null} />
        <StatsCard title="Risk Score" value="72/100" change="Medium" changeType="neutral" icon={null} />
      </div>

      {/* Charts + News */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 mb-5 lg:mb-6">
        <div className="lg:col-span-2">
          <ThreatChart />
        </div>
        <SecurityNews />
      </div>

      {/* Events */}
      <ThreatFeed />
    </motion.div>
  );
}
