import { NextRequest } from "next/server";
import { agentEvents } from "@/lib/events";

export async function GET(request: NextRequest) {
  const runId = request.nextUrl.searchParams.get("runId");

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const unsubscribe = agentEvents.subscribe((event) => {
        if (runId && event.runId !== runId) return;

        const data = JSON.stringify(event);
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));

        if (event.status === "completed" && event.taskType === "complete") {
          controller.close();
          unsubscribe();
        }
      });

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          clearInterval(heartbeat);
        }
      }, 15000);

      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        unsubscribe();
        try { controller.close(); } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
