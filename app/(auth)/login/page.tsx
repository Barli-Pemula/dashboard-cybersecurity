import type { Metadata } from "next";
import AuthScreen from "@/components/AuthScreen";
import { demoEnabled } from "@/lib/demo-auth";
export const metadata: Metadata = { title: "Sign in | CyberSentinel" };
export const dynamic = "force-dynamic";
export default function LoginPage() {
  return <AuthScreen allowDemo={demoEnabled()} />;
}
