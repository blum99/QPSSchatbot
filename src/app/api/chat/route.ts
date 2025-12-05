// src/app/api/chat/route.ts
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { threadId: existingThreadId, message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Missing 'message' in request body" },
        { status: 400 }
      );
    }

    // 1) Create or reuse a thread
    let threadId = existingThreadId as string | undefined;

    if (!threadId) {
      const thread = await openai.beta.threads.create();
      threadId = thread.id;
    }

    // 2) Add user message
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message,
    });

    // 3) Run assistant
    const run = await openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: process.env.OPENAI_ASSISTANT_ID!,
    });

    // 4) Check run completion
    if (run.status !== "completed") {
      return NextResponse.json(
        { error: `Run did not complete. Status: ${run.status}` },
        { status: 500 }
      );
    }

    // 5) Get final assistant message
    const messages = await openai.beta.threads.messages.list(threadId, {
      limit: 10,
    });

    const assistantMessage = messages.data.find(
      (m) => m.role === "assistant"
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
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
