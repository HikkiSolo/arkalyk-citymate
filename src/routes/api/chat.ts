import { createFileRoute } from "@tanstack/react-router";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, lang } = (await request.json()) as {
          messages: { role: "user" | "assistant"; content: string }[];
          lang: "kk" | "ru";
        };
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing key", { status: 500 });
        const openai = createOpenAI({
          baseURL: "https://ai.gateway.lovable.dev/v1",
          apiKey: key,
          headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
        });
        const result = streamText({
          model: openai.responses("openai/gpt-6-astra"),
          system: `You are "Арқалық Smart Navigator", a friendly city assistant for Arkalyk (Kostanay region, Kazakhstan). Help with transport, education (Arkalyk Pedagogical Institute named after I. Altynsarin, colleges, schools), student life, food, healthcare, akimat services and travel to other cities. Be concise (max ~120 words), use markdown lists when useful. Mention that details should be verified when unsure. Always reply in ${lang === "kk" ? "Kazakh" : "Russian"}.`,
          messages: messages.slice(-20),
          abortSignal: request.signal,
          providerOptions: {
            openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] },
          },
        });
        return result.toTextStreamResponse();
      },
    },
  },
});
