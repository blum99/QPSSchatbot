// src/app/api/chat/route.ts
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { assistantConfig, manualFunctionTools } from "@/config/assistant";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORGANIZATION,
  project: process.env.OPENAI_PROJECT,
});

const OPENAI_API_BASE_URL = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");

const ACTION_ENDPOINTS: Record<string, string> = {
  searchPensionsManual: "/vector_stores/vs_68df753c6f8c819199f785d76313f15a/search",
  searchHealthManual: "/vector_stores/vs_68df753edaf0819185c0e8f7c823b02a/search",
};

const TERMINAL_STATUSES = new Set([
  "completed",
  "failed",
  "cancelled",
  "expired",
]);

let assistantSetupEnsured = false;

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

    await ensureAssistantConfiguration(process.env.OPENAI_ASSISTANT_ID);

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

    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message,
    });

    const run = await createRunWithActions(threadId, process.env.OPENAI_ASSISTANT_ID);

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

async function createRunWithActions(threadId: string, assistantId: string) {
  let run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistantId,
  });

  while (!TERMINAL_STATUSES.has(run.status)) {
    if (run.status === "requires_action") {
      const toolCalls =
        run.required_action?.submit_tool_outputs?.tool_calls ?? [];

      if (toolCalls.length === 0) {
        throw new Error("Run requires action but no tool calls were supplied");
      }

      const tool_outputs = await handleToolCalls(toolCalls);
      run = await openai.beta.threads.runs.submitToolOutputs(threadId, run.id, {
        tool_outputs,
      });
      continue;
    }

    await delay(750);
    run = await openai.beta.threads.runs.retrieve(threadId, run.id);
  }

  return run;
}

async function handleToolCalls(toolCalls: any[]) {
  const outputs = [] as { tool_call_id: string; output: string }[];

  for (const call of toolCalls) {
    if (call.type !== "function" || !call.function?.name) {
      throw new Error("Unsupported tool call type");
    }

    const args = safeJsonParse(call.function.arguments);
    const query = typeof args?.query === "string" ? args.query : "";

    if (!query) {
      throw new Error(`Missing 'query' argument for ${call.function.name}`);
    }

    const outputPayload = await executeManualSearch(call.function.name, query);
    outputs.push({ tool_call_id: call.id, output: outputPayload });
  }

  return outputs;
}

async function executeManualSearch(actionName: string, query: string) {
  const endpoint = ACTION_ENDPOINTS[actionName];

  if (!endpoint) {
    throw new Error(`Unsupported action: ${actionName}`);
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    "Content-Type": "application/json",
    "OpenAI-Beta": "assistants=v2",
  };

  if (process.env.OPENAI_PROJECT) {
    headers["OpenAI-Project"] = process.env.OPENAI_PROJECT;
  }

  if (process.env.OPENAI_ORGANIZATION) {
    headers["OpenAI-Organization"] = process.env.OPENAI_ORGANIZATION;
  }

  const response = await fetch(`${OPENAI_API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ query }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data?.error?.message || `Search request failed for ${actionName}`
    );
  }

  return JSON.stringify(data);
}

function safeJsonParse(value: string | null | undefined) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureAssistantConfiguration(assistantId: string) {
  if (assistantSetupEnsured) {
    return;
  }

  const assistant = await openai.beta.assistants.retrieve(assistantId);
  const updatePayload: Record<string, any> = {};

  if (assistantConfig.name && assistant.name !== assistantConfig.name) {
    updatePayload.name = assistantConfig.name;
  }

  if (
    assistantConfig.description &&
    assistant.description !== assistantConfig.description
  ) {
    updatePayload.description = assistantConfig.description;
  }

  if (assistantConfig.instructions && assistant.instructions !== assistantConfig.instructions) {
    updatePayload.instructions = assistantConfig.instructions;
  }

  if (assistantConfig.model && assistant.model !== assistantConfig.model) {
    updatePayload.model = assistantConfig.model;
  }

  const currentTemperature =
    typeof assistant.temperature === "number" ? assistant.temperature : undefined;
  if (
    typeof assistantConfig.temperature === "number" &&
    assistantConfig.temperature !== currentTemperature
  ) {
    updatePayload.temperature = assistantConfig.temperature;
  }

  const currentTopP = typeof assistant.top_p === "number" ? assistant.top_p : undefined;
  if (typeof assistantConfig.top_p === "number" && assistantConfig.top_p !== currentTopP) {
    updatePayload.top_p = assistantConfig.top_p;
  }

  const currentMetadata = assistant.metadata ?? {};
  if (
    assistantConfig.metadata &&
    JSON.stringify(currentMetadata) !== JSON.stringify(assistantConfig.metadata)
  ) {
    updatePayload.metadata = assistantConfig.metadata;
  }

  if (
    assistantConfig.response_format &&
    JSON.stringify(assistant.response_format ?? {}) !==
      JSON.stringify(assistantConfig.response_format)
  ) {
    updatePayload.response_format = assistantConfig.response_format;
  }

  const existingTools = assistant.tools || [];
  const manualToolNames = new Set(
    manualFunctionTools.map((tool) => tool.function.name)
  );
  const manualToolsOutOfSync = manualFunctionTools.some((tool) => {
    const matchingTool = existingTools.find(
      (existingTool: any) =>
        existingTool.type === "function" &&
        existingTool.function?.name === tool.function.name
    );

    if (!matchingTool) {
      return true;
    }

    return !manualFunctionDefinitionMatches(matchingTool, tool);
  });

  if (manualToolsOutOfSync) {
    const preservedTools = existingTools.filter(
      (tool: any) =>
        !(
          tool.type === "function" &&
          tool.function?.name &&
          manualToolNames.has(tool.function.name)
        )
    );

    updatePayload.tools = [...preservedTools, ...manualFunctionTools];
  }

  if (Object.keys(updatePayload).length > 0) {
    await openai.beta.assistants.update(assistantId, updatePayload);
  }

  assistantSetupEnsured = true;
}

type ManualFunctionTool = (typeof manualFunctionTools)[number];

function manualFunctionDefinitionMatches(
  existingTool: any,
  desiredTool: ManualFunctionTool
) {
  if (existingTool.type !== "function" || !existingTool.function) {
    return false;
  }

  if (existingTool.function.name !== desiredTool.function.name) {
    return false;
  }

  const normalize = (fn: any) => ({
    name: fn?.name,
    description: fn?.description,
    parameters: fn?.parameters,
  });

  return (
    JSON.stringify(normalize(existingTool.function)) ===
    JSON.stringify(normalize(desiredTool.function))
  );
}
