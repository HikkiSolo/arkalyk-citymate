import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";

const RUN_ID_HEADER = "X-Lovable-AIG-Run-ID";

function createRunIdFetch(initialRunId?: string) {
  let runId = initialRunId?.trim() || undefined;
  let resolveRunId: (value: string | undefined) => void = () => undefined;
  let resolved = false;
  const ready = new Promise<string | undefined>((resolve) => { resolveRunId = resolve; });
  const publish = (value?: string) => {
    runId ??= value?.trim() || undefined;
    if (!resolved) { resolved = true; resolveRunId(runId); }
  };
  if (runId) publish(runId);
  return {
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      if (runId && !headers.has(RUN_ID_HEADER)) headers.set(RUN_ID_HEADER, runId);
      try {
        const response = await fetch(input, { ...init, headers });
        publish(response.headers.get(RUN_ID_HEADER) ?? undefined);
        return response;
      } catch (error) {
        publish();
        throw error;
      }
    },
    getRunId: () => runId,
    waitForRunId: () => runId ? Promise.resolve(runId) : ready,
  };
}

async function withRunId(response: Response, gateway: ReturnType<typeof createRunIdFetch>) {
  if (!response.body) return response;
  const reader = response.body.getReader();
  const firstChunk = reader.read();
  const runId = await gateway.waitForRunId();
  const headers = new Headers(response.headers);
  if (runId) headers.set(RUN_ID_HEADER, runId);
  headers.set("Access-Control-Expose-Headers", RUN_ID_HEADER);
  const body = new ReadableStream({
    async start(controller) {
      try {
        const first = await firstChunk;
        if (!first.done) controller.enqueue(first.value);
        while (!first.done) {
          const chunk = await reader.read();
          if (chunk.done) break;
          controller.enqueue(chunk.value);
        }
        controller.close();
      } catch (error) { controller.error(error); }
    },
    cancel: (reason) => reader.cancel(reason),
  });
  return new Response(body, { status: response.status, statusText: response.statusText, headers });
}

export async function handleCityChat(request: Request, messages: ModelMessage[], lang: "kk" | "ru") {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return Response.json({ message: lang === "kk" ? "AI қызметі бапталмаған." : "Сервис ИИ не настроен." }, { status: 500 });
  const gateway = createRunIdFetch(request.headers.get(RUN_ID_HEADER) ?? undefined);
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: gateway.fetch,
  });
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    instructions: `You are Арқалық Smart Navigator, a concise city assistant for Arkalyk, Kazakhstan. Answer in ${lang === "kk" ? "Kazakh" : "Russian"}. Help with public services, institutions, education, transport, local contacts and recommendations. Never invent exact contacts, schedules, admission scores or emergency details; clearly ask the user to verify time-sensitive facts. Keep answers under 120 words.`,
    messages,
    abortSignal: request.signal,
    providerOptions: { openai: { store: false, forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", include: ["reasoning.encrypted_content"] } },
  });
  return withRunId(result.toTextStreamResponse(), gateway);
}