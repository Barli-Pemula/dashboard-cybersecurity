import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAccess } from "@/lib/access";
import { createDemoWorkspace } from "@/lib/demo-data";

export async function GET() {
  try {
    const access = await getAccess();
    if (!access)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (access.demo) return NextResponse.json(createDemoWorkspace().threats);
    const threats = await prisma.threatEvent.findMany({
      orderBy: { timestamp: "desc" },
      take: 50,
    });

    return NextResponse.json(threats);
  } catch (error) {
    console.error("Error fetching threats:", error);
    return NextResponse.json(
      { error: "Failed to fetch threat data" },
      { status: 500 },
    );
  }
}
