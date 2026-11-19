import type { Metadata } from "next";
import AuthScreen from "@/components/AuthScreen";
import { demoEnabled } from "@/lib/demo-auth";
export const metadata: Metadata = { title: "Create account | CyberSentinel" };
export const dynamic = "force-dynamic";
export default function RegisterPage() {
  return <AuthScreen register allowDemo={demoEnabled()} />;
}
