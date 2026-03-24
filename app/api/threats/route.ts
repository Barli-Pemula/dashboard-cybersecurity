import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const threats = await prisma.threatEvent.findMany({
      orderBy: { timestamp: "desc" },
      take: 50,
    });

    return NextResponse.json(threats);
  } catch (error) {
    console.error("Error fetching threats:", error);
    return NextResponse.json(
      { error: "Failed to fetch threat data" },
      { status: 500 }
    );
  }
}
