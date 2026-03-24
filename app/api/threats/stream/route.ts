import { NextResponse } from "next/server";
import { generateThreatEvent } from "@/lib/threat-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();
  let intervalId: ReturnType<typeof setInterval>;

  const stream = new ReadableStream({
    start(controller) {
      // Send initial batch of events
      for (let i = 0; i < 5; i++) {
        const event = generateThreatEvent();
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
        );
      }

      // Then send one event every 2-4 seconds
      intervalId = setInterval(() => {
        try {
          const event = generateThreatEvent();
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          );
        } catch {
          clearInterval(intervalId);
          controller.close();
        }
      }, 2000 + Math.random() * 2000);
    },
    cancel() {
      clearInterval(intervalId);
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
