# Documentation Index

## Quick Navigation

### Getting Started
- **[README.md](README.md)** — Project overview, installation, environment setup
- **[QUICK-START.md](QUICK-START.md)** — Step-by-step setup and first run

### Frontend Versions
- **[FRONTEND-SELECTOR.md](FRONTEND-SELECTOR.md)** — Complete guide to switching between v1, v2, v3 (primary reference)
- **[VISUAL-GUIDE.md](VISUAL-GUIDE.md)** — Visual diagrams of folder structure and version flow

### Environment & Configuration
- **[docs/env.sample](docs/env.sample)** — Template for `.env.local` settings

### Archive
- Advanced integration guide: [.archive/FRONTEND-VERSION-INTEGRATION-GUIDE.md](.archive/FRONTEND-VERSION-INTEGRATION-GUIDE.md) (for reference when adding new versions)

---

## Project Structure

```
src/app/components/chat/
├── shared/          ← Shared types
├── v1/              ← Version 1 (simple layout)
├── v2/              ← Version 2 (figma modern ui)
└── v3/              ← Version 3 (enhanced v2)
```

## Common Tasks

**Switch frontend version:**
```bash
# Edit frontend.config.js
# Set FRONTEND_VERSION to "v1", "v2", or "v3"
# Restart dev server
npm run dev
```

**Set up environment:**
1. Copy `docs/env.sample` to `.env.local`
2. Add OpenAI credentials
3. Run `npm install && npm run dev`

**Add a new version:**
See [FRONTEND-SELECTOR.md](FRONTEND-SELECTOR.md) → "Adding a New Version"
