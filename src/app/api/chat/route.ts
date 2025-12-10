// src/app/api/chat/route.ts
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { vectorStoreIds } from "@/config/assistant";
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
const manualSelectionPrompt =
  "The backend could not determine whether this conversation is about ILO/PENSIONS or ILO/HEALTH. Ask the user to clarify before calling File Search. Do not run File Search until the correct manual is confirmed.";
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
    if (manualFromMessage) {
      threadManualMemory.set(threadId, manualFromMessage);
    }

    const manualForRun =
      manualFromMessage ?? threadManualMemory.get(threadId) ?? null;

    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message,
    });

    const run = await createRun(threadId, assistantId, manualForRun);

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
  manual: ManualKey | null
) {
  const runOptions: Record<string, any> = {
    assistant_id: assistantId,
  };

  if (manual) {
    runOptions.tool_resources = {
      file_search: {
        vector_store_ids: [vectorStoreIds[manual]],
      },
    };
  } else {
    runOptions.additional_instructions = manualSelectionPrompt;
  }

  let run = await openai.beta.threads.runs.create(threadId, runOptions);

  while (!TERMINAL_STATUSES.has(run.status)) {
    if (run.status === "requires_action") {
      throw new Error(
        "Assistant requested manual tool outputs but none are configured."
      );
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
