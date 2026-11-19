import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CyberSentinel | Security workspace",
  description:
    "Review security events, explore simulated assessments, and document your findings in one workspace.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#f8fafc",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-type="software">
      <body>{children}</body>
    </html>
  );
}
