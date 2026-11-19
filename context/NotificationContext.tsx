"use client";

import { createContext, useContext, useState, useCallback } from "react";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "threat" | "scan_complete" | "report_ready";
  severity: "critical" | "high" | "medium" | "low" | "info";
  read: boolean;
  createdAt: Date;
}

export interface Toast {
  id: string;
  title: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  toasts: Toast[];
  unreadCount: number;
  addNotification: (
    notification: Omit<Notification, "id" | "read" | "createdAt">,
  ) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  showToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "read" | "createdAt">) => {
      const newNotification: Notification = {
        ...notification,
        id: Math.random().toString(36).slice(2),
        read: false,
        createdAt: new Date(),
      };
      setNotifications((prev) => [newNotification, ...prev]);
    },
    [],
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { ...toast, id }]);

      if (toast.duration !== 0) {
        const duration = toast.duration || 5000;
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast],
  );

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        toasts,
        unreadCount,
        addNotification,
        removeNotification,
        markAsRead,
        markAllAsRead,
        showToast,
        removeToast,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within NotificationProvider",
    );
  }
  return context;
}
