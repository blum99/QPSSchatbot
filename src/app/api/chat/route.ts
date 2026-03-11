// src/app/api/chat/route.ts
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { vectorStoreIds, assistantConfig } from "@/config/assistant";

const proxyUrl = process.env.HTTPS_PROXY ?? process.env.HTTP_PROXY;

async function createOpenAIClient() {
  const options: ConstructorParameters<typeof OpenAI>[0] = {
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORGANIZATION,
    project: process.env.OPENAI_PROJECT,
  };
  if (proxyUrl) {
    const { HttpsProxyAgent } = await import("https-proxy-agent");
    options.httpAgent = new HttpsProxyAgent(proxyUrl);
  }
  return new OpenAI(options);
}

type ManualKey = keyof typeof vectorStoreIds;

const conversationManualMemory = new Map<string, ManualKey>();
const conversationPendingQuestion = new Map<string, string>();
const manualSelectionPrompt =
  "The backend could not determine whether this conversation is about ILO/PENSIONS or ILO/HEALTH. Ask the user to clarify before proceeding. Do not search any manual until the correct one is confirmed.";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    const { threadId: previousResponseId, message, model } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Missing 'message' in request body" },
        { status: 400 }
      );
    }

    const openai = await createOpenAIClient();
    const manualFromModel = inferManualFromModel(model);
    const manualFromMessage = inferManualFromText(message);
    let pendingQuestion: string | null = null;

    console.log("Model from frontend:", model);
    console.log("Manual from model:", manualFromModel);
    console.log("Manual from message:", manualFromMessage);

    // Check if user is trying to switch manuals mid-conversation
    if (previousResponseId) {
      const existingManual = conversationManualMemory.get(previousResponseId);
      if (existingManual && manualFromMessage && manualFromMessage !== existingManual) {
        const currentManualName = existingManual === "pensions" ? "ILO/PENSIONS" : "ILO/HEALTH";
        const requestedManualName = manualFromMessage === "pensions" ? "ILO/PENSIONS" : "ILO/HEALTH";
        return NextResponse.json({
          threadId: previousResponseId,
          reply: `This conversation is currently using the ${currentManualName} manual. To ask questions about ${requestedManualName}, please start a new conversation and select the appropriate tool.`,
          detectedManual: existingManual,
        });
      }
    }

    // Priority: explicit model selection > message inference
    const determinedManual = manualFromModel ?? manualFromMessage;

    if (determinedManual && previousResponseId) {
      conversationManualMemory.set(previousResponseId, determinedManual);
      if (isManualClarificationOnly(message)) {
        pendingQuestion = conversationPendingQuestion.get(previousResponseId) ?? null;
      }
      conversationPendingQuestion.delete(previousResponseId);
    }

    const manualForRun =
      determinedManual ??
      (previousResponseId ? conversationManualMemory.get(previousResponseId) : null) ??
      null;

    console.log("Final manual for run:", manualForRun);

    if (!manualForRun && previousResponseId) {
      conversationPendingQuestion.set(previousResponseId, message);
    }

    // Build per-call instructions
    const additionalInstructions = manualForRun
      ? buildManualInstruction(manualForRun, pendingQuestion)
      : manualSelectionPrompt;
    const fullInstructions = `${assistantConfig.instructions}\n\n${additionalInstructions}`;

    // Use built-in file_search when manual is known; no tool when awaiting clarification
    const tools: OpenAI.Responses.Tool[] = manualForRun
      ? [{ type: "file_search", vector_store_ids: [vectorStoreIds[manualForRun]] }]
      : [];

    const response = await openai.responses.create({
      model: assistantConfig.model,
      instructions: fullInstructions,
      input: message,
      ...(previousResponseId && { previous_response_id: previousResponseId }),
      tools,
      temperature: assistantConfig.temperature,
      top_p: assistantConfig.top_p,
    });

    const newResponseId = response.id;

    // Transfer conversation state to the new response ID
    if (previousResponseId) {
      if (manualForRun) {
        conversationManualMemory.set(newResponseId, manualForRun);
        conversationManualMemory.delete(previousResponseId);
      }
      const pending = conversationPendingQuestion.get(previousResponseId);
      if (pending) {
        conversationPendingQuestion.set(newResponseId, pending);
        conversationPendingQuestion.delete(previousResponseId);
      }
    } else if (determinedManual) {
      conversationManualMemory.set(newResponseId, determinedManual);
    }

    // Extract text content from response
    const text =
      response.output
        .find((o): o is OpenAI.Responses.ResponseOutputMessage => o.type === "message")
        ?.content.find(
          (c): c is OpenAI.Responses.ResponseOutputText => c.type === "output_text"
        )?.text ?? "";

    return NextResponse.json({
      threadId: newResponseId,
      reply: text,
      detectedManual: manualForRun,
    });
  } catch (err: unknown) {
    console.error("Error in /api/chat:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : typeof err === "object" && err !== null && "message" in err
            ? String((err as { message?: unknown }).message)
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}

function inferManualFromModel(model?: string): ManualKey | null {
  if (!model || model === "AUTO") return null;
  const normalizedModel = model.toUpperCase();
  if (normalizedModel.includes("PENSION")) return "pensions";
  if (normalizedModel.includes("HEALTH")) return "health";
  return null;
}

function inferManualFromText(text: string): ManualKey | null {
  if (/(ilo\/?health|health manual|\bhealth\b)/i.test(text)) return "health";
  if (/(ilo\/?pensions?|pension manual|\bpensions?\b)/i.test(text)) return "pensions";
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

function buildManualInstruction(manual: ManualKey, pendingQuestion: string | null = null) {
  const manualLabel = manual === "pensions" ? "ILO/PENSIONS" : "ILO/HEALTH";
  let instruction = `The backend classified this conversation as ${manualLabel}. Use the file search tool to retrieve relevant content from the manual before composing your reply. Base the response strictly on the retrieved content.`;

  if (pendingQuestion) {
    instruction += `\n\nIMPORTANT: The user's last message was just clarifying which manual to use. Their original question was: "${pendingQuestion}"\nSearch using the ORIGINAL QUESTION (not just the manual name).`;
  }

  return instruction;
}

