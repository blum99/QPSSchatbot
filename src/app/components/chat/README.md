# Chat components

This directory holds the single QPSS chat UI (version switching removed). The home page renders the ChatApp exported from this folder.

## Files
- `ChatApp.tsx` – main chat experience with chat, resources, and support views
- `ConversationSidebar.tsx` – conversation list, folders, and quick settings
- `ChatMessage.tsx` – renders chat messages with markdown and stable timestamps
- `DocumentsContacts.tsx` – resources/guidebooks/publications view with downloads
- `Support.tsx` – support/help desk view
- `SettingsMenu.tsx` – theme and language menu used across views
- `shared/types.ts` – shared types for messages, conversations, and folders

## Usage
- Entry point: `src/app/page.tsx` renders `<ChatApp />` directly.
- API: message sends call `/api/chat`; adjust payload/handling inside `ChatApp.tsx` if needed.
- Styling: Tailwind classes live inline; global styles come from `src/app/globals.css`.
- To change resources/support content, edit `DocumentsContacts.tsx` or `Support.tsx`.
