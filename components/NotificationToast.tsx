"use client";

import { useNotifications } from "@/context/NotificationContext";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export default function NotificationToast() {
  const reducedMotion = useReducedMotion();
  const { toasts, removeToast } = useNotifications();

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-status-online";
      case "error":
        return "bg-status-danger";
      case "warning":
        return "bg-status-warning";
      default:
        return "bg-surface-700";
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case "error":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      case "warning":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  return (
    <AnimatePresence mode="popLayout">
      <div
        className="fixed bottom-[88px] right-4 left-4 lg:bottom-6 sm:left-auto z-[100] flex flex-col gap-3 pointer-events-none"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={reducedMotion ? false : { opacity: 0, y: 12, x: 0 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12, x: 0 }}
            transition={{ duration: 0.2 }}
            className={`${getBackgroundColor(toast.type)} text-white rounded-lg shadow-lg p-4 flex items-start gap-3 pointer-events-none max-w-sm`}
          >
            <div className="flex-shrink-0 mt-0.5">{getIcon(toast.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{toast.title}</p>
              <p className="text-xs opacity-90 mt-0.5">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-white hover:opacity-75 transition-opacity pointer-events-auto min-h-11 min-w-11 inline-flex items-center justify-center -mr-2 -my-2"
              aria-label="Close"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
}
