import "server-only";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DEMO_COOKIE, validDemoToken } from "@/lib/demo-auth";
import type { Access } from "@/lib/types";

export async function getAccess(): Promise<Access | null> {
  if (await validDemoToken((await cookies()).get(DEMO_COOKIE)?.value)) {
    return {
      id: "demo-analyst",
      name: "Demo analyst",
      email: "demo@cybersentinel.example",
      demo: true,
    };
  }
  const session = await getServerSession(authOptions);
  const user = session?.user as
    { id?: string; name?: string | null; email?: string | null } | undefined;
  return user?.id
    ? {
        id: user.id,
        name: user.name || "Analyst",
        email: user.email || "",
        demo: false,
      }
    : null;
}
