import fs from "node:fs";
import path from "node:path";
import { config as loadEnv } from "dotenv";
import OpenAI from "openai";
import { ensureAssistantConfiguration } from "@/lib/assistantSync";

const projectRoot = path.resolve(__dirname, "..");

function loadEnvIfPresent(fileName: string) {
  const fullPath = path.join(projectRoot, fileName);
  if (fs.existsSync(fullPath)) {
    loadEnv({ path: fullPath, override: true });
  }
}

// Load .env first, then let .env.local override values when present.
loadEnvIfPresent(".env");
loadEnvIfPresent(".env.local");

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  const assistantId = process.env.OPENAI_ASSISTANT_ID;

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  if (!assistantId) {
    throw new Error("Missing OPENAI_ASSISTANT_ID");
  }

  const openai = new OpenAI({
    apiKey,
    organization: process.env.OPENAI_ORGANIZATION,
    project: process.env.OPENAI_PROJECT,
    baseURL: (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, ""),
  });

  const result = await ensureAssistantConfiguration({
    openai,
    assistantId,
    mode: "auto",
  });

  if (result.updated) {
    console.log("Assistant configuration updated.");
    return;
  }

  console.log("Assistant already up to date.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
