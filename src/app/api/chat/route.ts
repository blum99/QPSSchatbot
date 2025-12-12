// src/app/api/chat/route.ts
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { vectorStoreIds, assistantConfig } from "@/config/assistant";
import {
  ensureAssistantConfiguration,
  type AssistantSyncMode,
} from "@/lib/assistantSync";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORGANIZATION,
  project: process.env.OPENAI_PROJECT,
});

const TERMINAL_STATUSES = new Set([
  "completed",
  "failed",
  "cancelled",
  "expired",
]);

const assistantSyncMode = resolveAssistantSyncMode(
  process.env.OPENAI_ASSISTANT_SYNC_MODE
);
const threadManualMemory = new Map<string, ManualKey>();
const threadPendingQuestion = new Map<string, string>();
const manualActionMap = {
  searchPensionsManual: "pensions",
  searchHealthManual: "health",
} as const;
const vectorSearchCache = new Map<string, VectorSearchCacheEntry>();
const VECTOR_SEARCH_CACHE_TTL_MS = 60_000;
const VECTOR_SEARCH_MAX_ATTEMPTS = 3;
const VECTOR_SEARCH_BASE_DELAY_MS = 500;
const manualSelectionPrompt =
  "The backend could not determine whether this conversation is about ILO/PENSIONS or ILO/HEALTH. Ask the user to clarify before calling searchPensionsManual or searchHealthManual. Do not invoke either Action until the correct manual is confirmed.";
let assistantSetupPromise: Promise<void> | null = null;
let manualSyncModeLogged = false;

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_ASSISTANT_ID) {
      return NextResponse.json(
        { error: "Missing OPENAI_ASSISTANT_ID" },
        { status: 500 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    const assistantId = process.env.OPENAI_ASSISTANT_ID;

    await ensureAssistantReady(assistantId);

    const { threadId: existingThreadId, message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Missing 'message' in request body" },
        { status: 400 }
      );
    }

    let threadId = existingThreadId as string | undefined;

    if (!threadId) {
      const thread = await openai.beta.threads.create();
      threadId = thread.id;
    }

    const manualFromMessage = inferManualFromText(message);
    let pendingQuestion: string | null = null;

    if (manualFromMessage) {
      threadManualMemory.set(threadId, manualFromMessage);

      // Check if this is just a clarification (e.g., "pensions") and we have a pending question
      if (isManualClarificationOnly(message)) {
        pendingQuestion = threadPendingQuestion.get(threadId) ?? null;
      }
      // Clear pending question once manual is known
      threadPendingQuestion.delete(threadId);
    }

    const manualForRun =
      manualFromMessage ?? threadManualMemory.get(threadId) ?? null;

    // If no manual could be determined, store this message as a pending question
    if (!manualForRun) {
      threadPendingQuestion.set(threadId, message);
    }

    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message,
    });

    const run = await createRun(threadId, assistantId, manualForRun, pendingQuestion);

    if (run.status !== "completed") {
      const errorMessage =
        run.last_error?.message || `Run did not complete. Status: ${run.status}`;
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    const messages = await openai.beta.threads.messages.list(threadId, {
      limit: 10,
      order: "desc",
    });

    const assistantMessage = messages.data.find(
      (m) => m.role === "assistant" && ("run_id" in m ? m.run_id === run.id : true)
    );

    if (!assistantMessage) {
      return NextResponse.json(
        { error: "No assistant message found" },
        { status: 500 }
      );
    }

    const textParts = assistantMessage.content
      .filter((part: any) => part.type === "text")
      .map((part: any) => part.text?.value ?? "");

    return NextResponse.json({
      threadId,
      reply: textParts.join("\n\n"),
    });
  } catch (err: any) {
    console.error("Error in /api/chat:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

async function createRun(
  threadId: string,
  assistantId: string,
  manual: ManualKey | null,
  pendingQuestion: string | null = null
) {
  const additionalInstructions = manual
    ? buildManualInstruction(manual, pendingQuestion)
    : manualSelectionPrompt;

  const runPayload: OpenAI.Beta.Threads.Runs.RunCreateParams = {
    assistant_id: assistantId,
    additional_instructions: additionalInstructions,
  };

  if (manual) {
    const actionName = manualToAction(manual);
    runPayload.tool_choice = {
      type: "function",
      function: { name: actionName },
    } as const;
    runPayload.tools = assistantConfig.tools?.map((tool) => ({ ...tool }));
  }

  let run = await openai.beta.threads.runs.create(threadId, runPayload);

  while (!TERMINAL_STATUSES.has(run.status)) {

    if (run.status === "requires_action") {
      run = await fulfillRequiredActions(threadId, run);
      continue;
    }

    await delay(750);
    run = await openai.beta.threads.runs.retrieve(threadId, run.id);
  }

  return run;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveAssistantSyncMode(value?: string | null): AssistantSyncMode {
  return value === "manual" ? "manual" : "auto";
}

type ManualKey = keyof typeof vectorStoreIds;
type ManualActionName = keyof typeof manualActionMap;
function manualToAction(manual: ManualKey): ManualActionName {
  return manual === "pensions" ? "searchPensionsManual" : "searchHealthManual";
}
type VectorSearchCacheEntry = {
  expiresAt: number;
  payload: unknown;
};
type VectorStoreError = Error & { status?: number };

function inferManualFromText(text: string): ManualKey | null {
  const normalized = text.toLowerCase();

  if (/(ilo\/?health|health manual|\bhealth\b)/i.test(normalized)) {
    return "health";
  }

  if (/(ilo\/?pensions?|pension manual|\bpensions?\b)/i.test(normalized)) {
    return "pensions";
  }

  return null;
}

function isManualClarificationOnly(text: string): boolean {
  const stripped = text.trim().toLowerCase();
  const clarificationPatterns = [
    /^(ilo\/?)?(pensions?|health)$/,
    /^it'?s\s+(ilo\/?)?(pensions?|health)$/,
    /^(the\s+)?(ilo\/?)?(pensions?|health)\s*(one|tool|manual)?$/,
  ];
  return clarificationPatterns.some((pattern) => pattern.test(stripped));
}

async function ensureAssistantReady(assistantId: string) {
  if (assistantSyncMode === "manual") {
    if (!manualSyncModeLogged) {
      console.info(
        "OPENAI_ASSISTANT_SYNC_MODE=manual — skipping assistant auto-sync."
      );
      manualSyncModeLogged = true;
    }
    return;
  }

  if (!assistantSetupPromise) {
    assistantSetupPromise = ensureAssistantConfiguration({
      openai,
      assistantId,
      mode: assistantSyncMode,
    })
      .then(() => undefined)
      .catch((error) => {
        assistantSetupPromise = null;
        throw error;
      });
  }

  await assistantSetupPromise;
}

function buildManualInstruction(manual: ManualKey, pendingQuestion: string | null = null) {
  const isPensions = manual === "pensions";
  const manualLabel = isPensions ? "ILO/PENSIONS" : "ILO/HEALTH";
  const actionName = manualToAction(manual);

  let instruction = `The backend classified this conversation as ${manualLabel}. Call ${actionName} with a precise query before composing your reply, and base the response strictly on the returned chunks.`;

  if (pendingQuestion) {
    instruction += `\n\nIMPORTANT: The user's last message was just clarifying which manual to use. Their original question was: "${pendingQuestion}"\nUse the ORIGINAL QUESTION (not just the manual name) to form your search query.`;
  }

  return instruction;
}

async function fulfillRequiredActions(
  threadId: string,
  run: OpenAI.Beta.Threads.Run
) {
  const submitBlock = run.required_action?.submit_tool_outputs;

  if (!submitBlock || !submitBlock.tool_calls?.length) {
    throw new Error("Assistant requested tool outputs but none were provided.");
  }

  const toolOutputs = await Promise.all(
    submitBlock.tool_calls.map(async (toolCall) => {
      if (toolCall.type !== "function") {
        throw new Error(`Unsupported tool call type: ${toolCall.type}`);
      }

      const output = await resolveManualToolCall(
        toolCall.function.name,
        toolCall.function.arguments ?? "{}"
      );

      return {
        tool_call_id: toolCall.id,
        output,
      };
    })
  );

  return openai.beta.threads.runs.submitToolOutputs(threadId, run.id, {
    tool_outputs: toolOutputs,
  });
}

async function resolveManualToolCall(functionName: string, rawArgs: string) {
  if (!isManualActionName(functionName)) {
    throw new Error(`Unsupported function call: ${functionName}`);
  }

  const args = parseToolArguments(rawArgs);
  const query = typeof args.query === "string" ? args.query.trim() : "";

  if (!query) {
    throw new Error(`${functionName} requires a non-empty 'query' string.`);
  }

  const manualKey = manualActionMap[functionName];
  const result = await callVectorStoreSearch(manualKey, query);
  return JSON.stringify(result);
}

function isManualActionName(name: string): name is ManualActionName {
  return name in manualActionMap;
}

function parseToolArguments(rawArgs: string) {
  if (!rawArgs || !rawArgs.trim()) {
    return {};
  }

  try {
    return JSON.parse(rawArgs);
  } catch (error) {
    throw new Error(`Invalid tool arguments JSON: ${String(error)}`);
  }
}

async function callVectorStoreSearch(manualKey: ManualKey, query: string) {
  const normalizedQuery = normalizeQueryKey(query);
  const cacheKey = buildCacheKey(manualKey, normalizedQuery);
  const cached = vectorSearchCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    console.info("[vector-search] cache hit", {
      manual: manualKey,
      query: normalizedQuery,
    });
    return cached.payload;
  }

  const vectorStoreId = vectorStoreIds[manualKey];
  let attempt = 0;
  let backoffDelay = VECTOR_SEARCH_BASE_DELAY_MS;
  let lastError: Error | null = null;

  while (attempt < VECTOR_SEARCH_MAX_ATTEMPTS) {
    attempt += 1;

    try {
      const payload = await executeVectorStoreFetch(vectorStoreId, query);

      vectorSearchCache.set(cacheKey, {
        payload,
        expiresAt: Date.now() + VECTOR_SEARCH_CACHE_TTL_MS,
      });

      console.info("[vector-search] success", {
        manual: manualKey,
        attempt,
        cached: false,
      });

      return payload;
    } catch (error) {
      lastError = error as Error;
      const retryable = isRetryableVectorError(lastError);

      console.warn("[vector-search] failure", {
        manual: manualKey,
        attempt,
        retryable,
        message: lastError.message,
      });

      if (!retryable || attempt >= VECTOR_SEARCH_MAX_ATTEMPTS) {
        throw lastError;
      }

      await delay(withJitter(backoffDelay));
      backoffDelay *= 2;
    }
  }

  throw lastError ?? new Error("Vector store search failed for unknown reasons.");
}

function buildCacheKey(manualKey: ManualKey, query: string) {
  return `${manualKey}::${query}`;
}

async function executeVectorStoreFetch(vectorStoreId: string, query: string) {
  const response = await fetch(
    `https://api.openai.com/v1/vector_stores/${vectorStoreId}/search`,
    {
      method: "POST",
      headers: buildOpenAIHeaders(),
      body: JSON.stringify({ query }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    const vectorError = new Error(
      `Vector store search failed (${response.status}): ${errorText || response.statusText}`
    ) as VectorStoreError;
    vectorError.status = response.status;
    throw vectorError;
  }

  return response.json();
}

function isRetryableVectorError(error: Error) {
  const status = (error as VectorStoreError).status;

  if (typeof status === "number") {
    return status === 429 || (status >= 500 && status < 600);
  }

  return error instanceof TypeError;
}

function withJitter(delayMs: number) {
  const jitter = Math.random() * 0.3 * delayMs;
  return Math.round(delayMs + jitter);
}

function normalizeQueryKey(query: string) {
  return query.trim().replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").toLowerCase();
}

function buildOpenAIHeaders() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY for vector store search.");
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    "Content-Type": "application/json",
  };

  if (process.env.OPENAI_ORGANIZATION) {
    headers["OpenAI-Organization"] = process.env.OPENAI_ORGANIZATION;
  }

  if (process.env.OPENAI_PROJECT) {
    headers["OpenAI-Project"] = process.env.OPENAI_PROJECT;
  }

  return headers;
}
