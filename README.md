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

Example values live in `docs/env.sample`. Next.js will load `.env.local` automatically in dev.

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
