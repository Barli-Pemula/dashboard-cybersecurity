"use client";

import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
}

export default function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4 lg:p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-surface-400 uppercase tracking-wide">
          {title}
        </p>
        {change && (
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
              changeType === "positive"
                ? "bg-green-50 text-green-700"
                : changeType === "negative"
                ? "bg-red-50 text-red-600"
                : "bg-surface-100 text-surface-500"
            }`}
          >
            {change}
          </span>
        )}
      </div>
      <p className="text-xl lg:text-2xl font-bold text-surface-800">{value}</p>
    </motion.div>
  );
}
