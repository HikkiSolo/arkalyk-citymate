import { createFileRoute } from "@tanstack/react-router";
import type { ModelMessage } from "ai";
import { z } from "zod";
import { handleCityChat } from "@/lib/ai-gateway.server";

const requestSchema = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(4000) })).min(1).max(20),
  lang: z.enum(["kk", "ru"]),
});

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = requestSchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return Response.json({ message: "Invalid request" }, { status: 400 });
        return handleCityChat(request, parsed.data.messages as ModelMessage[], parsed.data.lang);
      },
    },
  },
});