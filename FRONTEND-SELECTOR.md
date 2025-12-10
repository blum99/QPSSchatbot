# Frontend Version Selector

This branch allows you to switch between different frontend implementations.

## Available Versions

- **v1**: Original simple layout
  - Basic sidebar with conversation list
  - Simple header
  - Chat messages
  - Input box

- **v2**: Figma Modern UI
  - Enhanced sidebar with theme toggle
  - Data Source switcher (ILO/Health vs ILO/Pensions)
  - View switcher (Chat vs Resources)
  - User menu with profile
  - DocumentsContacts resource view
  - Modern shadcn/ui components

- **v3, v4, etc.**: Future versions (to be added)

## How to Switch Versions

1. **Edit `.env.local`**:
   ```bash
   NEXT_PUBLIC_FRONTEND_VERSION=v2  # Change to v1, v2, v3, etc.
   ```

2. **Restart the dev server**:
   ```bash
   npm run dev
   ```

3. **Refresh your browser** at http://localhost:3000

## Adding New Versions

To add a new frontend version (e.g., v3):

1. Create your new ChatApp component:
   ```bash
   src/app/components/chat/ChatApp-v3.tsx
   ```

2. Import it in `src/app/page.tsx`:
   ```typescript
   import { ChatApp as ChatAppV3 } from "./components/chat/ChatApp-v3";
   ```

3. Add it to the versions object:
   ```typescript
   const versions = {
     v1: ChatAppV1,
     v2: ChatAppV2,
     v3: ChatAppV3, // Your new version
   };
   ```

4. Set the environment variable and restart:
   ```bash
   NEXT_PUBLIC_FRONTEND_VERSION=v3
   ```

## File Structure

```
src/app/components/chat/
├── ChatApp-v1.tsx          # Original layout
├── ChatApp-v2.tsx          # Figma Modern UI
├── ChatApp-v3.tsx          # Future version
├── ChatMessage.tsx         # Shared component
├── ConversationSidebar.tsx # Shared component
├── DocumentsContacts.tsx   # v2+ feature
└── types.ts                # Shared types
```

## Notes

- All versions share the same backend API (`/api/chat/route.ts`)
- All versions maintain OpenAI Assistant integration
- Switching versions does not affect your data or conversations
- The environment variable must start with `NEXT_PUBLIC_` to be available in the browser
