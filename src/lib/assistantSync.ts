import crypto from "node:crypto";
import type OpenAI from "openai";
import { assistantConfig } from "@/config/assistant";

export type AssistantSyncMode = "auto" | "manual";

const assistantConfigHash = crypto
  .createHash("sha256")
  .update(JSON.stringify(assistantConfig))
  .digest("hex");

const desiredMetadata = {
  ...(assistantConfig.metadata ?? {}),
  config_hash: assistantConfigHash,
};

export async function ensureAssistantConfiguration({
  openai,
  assistantId,
  mode = "auto",
}: {
  openai: OpenAI;
  assistantId: string;
  mode?: AssistantSyncMode;
}) {
  if (mode === "manual") {
    return { skipped: true, updated: false } as const;
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

  if (
    assistantConfig.instructions &&
    assistant.instructions !== assistantConfig.instructions
  ) {
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

  const currentTopP =
    typeof assistant.top_p === "number" ? assistant.top_p : undefined;
  if (
    typeof assistantConfig.top_p === "number" &&
    assistantConfig.top_p !== currentTopP
  ) {
    updatePayload.top_p = assistantConfig.top_p;
  }

  const currentMetadata = assistant.metadata ?? {};
  if (
    assistantConfig.metadata &&
    JSON.stringify(currentMetadata) !== JSON.stringify(desiredMetadata)
  ) {
    updatePayload.metadata = desiredMetadata;
  }

  if (
    assistantConfig.response_format &&
    JSON.stringify(assistant.response_format ?? {}) !==
      JSON.stringify(assistantConfig.response_format)
  ) {
    updatePayload.response_format = assistantConfig.response_format;
  }

  if (
    assistantConfig.tools &&
    JSON.stringify(assistant.tools ?? []) !== JSON.stringify(assistantConfig.tools)
  ) {
    updatePayload.tools = assistantConfig.tools;
  }

  if (Object.keys(updatePayload).length === 0) {
    return { skipped: false, updated: false } as const;
  }

  await openai.beta.assistants.update(assistantId, updatePayload);
  return { skipped: false, updated: true } as const;
}
