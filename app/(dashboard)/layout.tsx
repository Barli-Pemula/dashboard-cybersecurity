import { redirect } from "next/navigation";
import { getAccess } from "@/lib/access";
import AppShell from "@/components/AppShell";
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await getAccess();
  if (!access) redirect("/login");
  return <AppShell access={access}>{children}</AppShell>;
}
