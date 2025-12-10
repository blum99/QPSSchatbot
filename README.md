This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Install the project dependencies:

```bash
npm install
```

Then start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Required environment

Create a `.env.local` (local) or add Codespaces secrets with these keys:

- `OPENAI_API_KEY` (required)
- `OPENAI_ASSISTANT_ID` (required)
- `OPENAI_PROJECT` (optional)
- `OPENAI_ORGANIZATION` (optional)
- `OPENAI_BASE_URL` (optional; defaults to https://api.openai.com/v1)
- `OPENAI_ASSISTANT_SYNC_MODE` (optional; `auto` by default, set to `manual` to skip on-request assistant updates)

Example values live in `docs/env.sample`. Next.js will load `.env.local` automatically in dev.

### Syncing the OpenAI Assistant outside requests

The API route now defaults to `OPENAI_ASSISTANT_SYNC_MODE=auto`, which keeps the remote assistant in sync during the first request handled by each server instance. This guarantees correctness but adds an extra round trip on cold starts. To avoid the latency penalty:

1. Run `npm run sync:assistant` whenever you change `src/config/assistant.ts`. The script uses the same config to push updates via the OpenAI API.
2. Deploy with `OPENAI_ASSISTANT_SYNC_MODE=manual`. In this mode the runtime skips the sync step entirely, so cold starts no longer incur the additional API call. Remember to rerun the sync script before each deploy (or wire it into CI) to keep the assistant current.

### Vector store file search

The assistant exposes OpenAI's `file_search` tool. `src/config/assistant.ts` keeps the two vector store IDs in `vectorStoreIds`, and the `/api/chat` route selects exactly one ID per run based on simple keyword heuristics (mentions of "pension" or "health"). When we cannot determine the tool, the run omits a store and the assistant is instructed to ask the user to clarify before searching. Update `vectorStoreIds` whenever you rotate or rebuild a store, rerun `npm run sync:assistant`, and remind users to mention the target manual at least once per conversation so subsequent turns stay routed correctly.

### Adding secrets in GitHub Codespaces
1) In GitHub: **Settings → Codespaces secrets** (org or repo scope) → **New secret** for each key above.
2) Rebuild or restart the Codespace so the variables are injected.
3) Run `npm run dev` inside the Codespace; the API route will read the secrets from the environment.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
