# QPSS Chatbot

A Next.js chatbot that answers questions about the ILO/PENSIONS and ILO/HEALTH actuarial valuation platforms using the OpenAI Responses API with built-in file search against the official user manuals.

## Getting Started

Install the project dependencies:

```bash
npm install
```

Create a `.env.local` file at the project root (copy from `.env.example`) and fill in your secrets:

```bash
cp .env.example .env.local
```

Then start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Frontend

The app renders a single chat experience from [src/app/components/chat](src/app/components/chat). Update [src/app/page.tsx](src/app/page.tsx) or the components in that folder to change the UI.

## Required environment

Create a `.env.local` file (locally) or add Codespaces secrets with these keys:

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | ✅ | Your OpenAI API key |
| `OPENAI_PROJECT` | optional | OpenAI project ID |
| `OPENAI_ORGANIZATION` | optional | OpenAI organization ID |
| `OPENAI_BASE_URL` | optional | Defaults to `https://api.openai.com/v1` |
| `HTTPS_PROXY` / `HTTP_PROXY` | optional | Corporate proxy URL |

Example values live in `.env.example` at the project root. Next.js will load `.env.local` automatically in dev.

## How it works

The API route ([src/app/api/chat/route.ts](src/app/api/chat/route.ts)) uses the **OpenAI Responses API** (`openai.responses.create`). Conversation continuity is maintained via `previous_response_id` — no server-side thread storage is required beyond tracking which manual is active for a given conversation.

### Model and assistant configuration

`src/config/assistant.ts` centralises:
- The model name and generation parameters (`temperature`, `top_p`)
- The full system instructions / persona
- The two vector store IDs (`vectorStoreIds.pensions`, `vectorStoreIds.health`)

To change the model or update the system prompt, edit that file and redeploy — no external sync step is needed.

### Vector store file search

`/api/chat` injects OpenAI's built-in `file_search` tool with exactly one vector store per request, selected by:
1. The manual the user explicitly chose in the UI (ILO/PENSIONS or ILO/HEALTH)
2. Keyword heuristics on the message text if the UI is set to AUTO mode

When neither source determines the manual, the route omits the search tool and instructs the model to ask the user to clarify before proceeding. Update `vectorStoreIds` in `src/config/assistant.ts` whenever you rotate or rebuild a store, and remind users to mention the target manual at least once so subsequent turns stay routed correctly.

### Adding secrets in GitHub Codespaces
1. In GitHub: **Settings → Codespaces secrets** (org or repo scope) → **New secret** for each key above.
2. Rebuild or restart the Codespace so the variables are injected.
3. Run `npm run dev` inside the Codespace; the API route will read the secrets from the environment.
