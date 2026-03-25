"use client";

import { NotificationProvider } from "@/context/NotificationContext";
import NotificationToast from "@/components/NotificationToast";

export default function ClientNotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationProvider>
      <NotificationToast />
      {children}
    </NotificationProvider>
  );
}
