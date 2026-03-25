"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Activity {
  id: string;
  type: "scan" | "report";
  title: string;
  message: string;
  timestamp: string;
  metadata?: {
    targetUrl?: string;
    riskScore?: number;
    status?: string;
    scanType?: string;
    reportType?: string;
    severity?: string;
  };
}

export default function NotificationDropdown() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (showDropdown) {
      fetchActivities();
    }
  }, [showDropdown]);

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    if (type === "scan") {
      return (
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
    );
  };

  const getRiskColor = (riskScore?: number) => {
    if (!riskScore) return "text-surface-600";
    if (riskScore >= 80) return "text-red-600";
    if (riskScore >= 60) return "text-orange-600";
    if (riskScore >= 40) return "text-yellow-600";
    return "text-green-600";
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-surface-400 hover:text-surface-600 rounded-lg hover:bg-surface-100 transition-colors"
        aria-label="Activity history"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
      </button>

      <AnimatePresence>
        {showDropdown && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 top-full mt-1.5 w-96 bg-white border border-surface-200 rounded-xl shadow-lg z-50 max-h-96 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-surface-200">
                <h3 className="font-semibold text-surface-900">Your Activity</h3>
                <p className="text-xs text-surface-500 mt-1">Recent scans and reports</p>
              </div>

              {/* Activities List */}
              <div className="overflow-y-auto flex-1">
                {isLoading ? (
                  <div className="p-6 text-center">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                      <span className="text-sm text-surface-500">Loading...</span>
                    </div>
                  </div>
                ) : activities.length === 0 ? (
                  <div className="p-8 text-center text-surface-400">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <p className="text-sm font-medium">No activity yet</p>
                    <p className="text-xs mt-1">Start by creating a scan or report</p>
                  </div>
                ) : (
                  <div className="divide-y divide-surface-100">
                    {activities.map((activity) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="px-4 py-3 hover:bg-surface-50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          {getActivityIcon(activity.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-surface-900 truncate">
                              {activity.title}
                            </p>
                            
                            {/* Activity Details */}
                            <div className="mt-1 space-y-1">
                              {activity.type === "scan" && activity.metadata?.targetUrl && (
                                <p className="text-xs text-surface-600 truncate">
                                  🔗 {activity.metadata.targetUrl}
                                </p>
                              )}
                              {activity.type === "scan" && activity.metadata?.riskScore !== undefined && (
                                <p className={`text-xs font-medium ${getRiskColor(activity.metadata.riskScore)}`}>
                                  Risk Score: {activity.metadata.riskScore}/100
                                </p>
                              )}
                              {activity.type === "scan" && activity.metadata?.status && (
                                <p className="text-xs text-surface-500">
                                  Status: <span className="capitalize font-medium">{activity.metadata.status}</span>
                                </p>
                              )}
                              {activity.type === "report" && activity.metadata?.reportType && (
                                <p className="text-xs text-surface-500">
                                  Type: <span className="capitalize font-medium">{activity.metadata.reportType}</span>
                                </p>
                              )}
                              {activity.type === "report" && activity.metadata?.severity && (
                                <p className="text-xs text-surface-500">
                                  Severity: <span className="capitalize font-medium">{activity.metadata.severity}</span>
                                </p>
                              )}
                            </div>

                            <p className="text-xs text-surface-400 mt-2">
                              {formatTime(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
