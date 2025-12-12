# Frontend Version Structure

This directory contains all frontend versions organized in a modular, self-contained structure.

## 📁 Folder Structure

```
src/app/components/chat/
├── shared/          # Shared components and types used across all versions
│   └── types.ts     # Common TypeScript interfaces (Message, Conversation, Folder)
├── v1/              # Version 1 - Original Simple Layout
│   ├── index.tsx              # Main ChatApp component (exported as ChatApp)
│   ├── ChatMessage.tsx        # Message display component
│   └── ConversationSidebar.tsx # Sidebar with conversation list
├── v2/              # Version 2 - Figma Modern UI
│   ├── index.tsx              # Main ChatApp component (exported as ChatApp)
│   ├── ChatMessage.tsx        # Message display with markdown
│   ├── ConversationSidebar.tsx # Enhanced sidebar with folders
│   └── DocumentsContacts.tsx  # Resources and Support views
└── v3/              # Version 3 - Template (Ready for your design)
    └── index.tsx              # Template ChatApp component
```

## 🎯 How It Works

### Version Selection
The active version is controlled by the `NEXT_PUBLIC_FRONTEND_VERSION` environment variable in `.env.local`:
```bash
NEXT_PUBLIC_FRONTEND_VERSION=v2  # Change to v1, v2, or v3
```

### Main Entry Point
`src/app/page.tsx` imports and selects the appropriate version:
```typescript
import { ChatApp as ChatAppV1 } from "./components/chat/v1";
import { ChatApp as ChatAppV2 } from "./components/chat/v2";
import { ChatApp as ChatAppV3 } from "./components/chat/v3";
```

## ✨ Adding a New Version (e.g., v4)

### Step 1: Create Version Folder
```bash
mkdir src/app/components/chat/v4
```

### Step 2: Create Your Components
Start with the template or copy from an existing version:
```bash
# Option A: Start from template
cp src/app/components/chat/v3/index.tsx src/app/components/chat/v4/index.tsx

# Option B: Copy from existing version
cp -r src/app/components/chat/v2/* src/app/components/chat/v4/
```

### Step 3: Update Imports
Make sure your components import types from shared:
```typescript
import { Conversation, Message, Folder } from "../shared/types";
```

### Step 4: Register in page.tsx
Edit `src/app/page.tsx`:
```typescript
import { ChatApp as ChatAppV4 } from "./components/chat/v4";

const versions = {
  v1: ChatAppV1,
  v2: ChatAppV2,
  v3: ChatAppV3,
  v4: ChatAppV4,  // Add this
};
```

### Step 5: Activate
Update `.env.local`:
```bash
NEXT_PUBLIC_FRONTEND_VERSION=v4
```

### Step 6: Restart
```bash
npm run dev
```

## 🗑️ Deleting a Version

To remove a version (e.g., v1) without affecting others:

```bash
# 1. Delete the folder
rm -rf src/app/components/chat/v1

# 2. Remove from page.tsx
# Delete the import line:
# import { ChatApp as ChatAppV1 } from "./components/chat/v1";
# 
# Delete from versions object:
# v1: ChatAppV1,

# 3. Restart dev server
npm run dev
```

**Important**: Each version is completely isolated. Deleting v1 won't affect v2 or v3.

## 📋 Shared Components

### types.ts
Contains common TypeScript interfaces used across all versions:
- `Message` - Chat message structure
- `Conversation` - Conversation metadata
- `Folder` - Folder structure for organizing conversations
- `Sender` - Message sender type ("user" | "bot")

**When to modify shared types:**
- Only modify if the change applies to ALL versions
- If a type is version-specific, keep it in that version's folder
- Breaking changes to shared types will affect all versions

## 🔧 Best Practices

### Version Isolation
- Each version folder should be self-contained
- Don't create dependencies between versions
- Shared code goes in `shared/` only

### Component Organization
```
v2/
├── index.tsx           # Main export (ChatApp component)
├── ChatMessage.tsx     # Reusable components
├── Sidebar.tsx
├── Header.tsx
└── utils.ts           # Version-specific utilities
```

### Import Patterns
```typescript
// ✅ Good - Import from shared
import { Message } from "../shared/types";

// ✅ Good - Import from same version
import { ChatMessage } from "./ChatMessage";

// ❌ Bad - Import from other version
import { ChatMessage } from "../v1/ChatMessage";
```

### Naming Convention
- Main component must be exported as `ChatApp`
- File name is `index.tsx` for easy imports
- Other components can have descriptive names

## 🚀 Deployment

### Production Build
```bash
# Set your desired version
echo "NEXT_PUBLIC_FRONTEND_VERSION=v2" > .env.production

# Build
npm run build

# Test production build locally
npm start
```

### Environment Variables
```bash
# Development
.env.local → NEXT_PUBLIC_FRONTEND_VERSION=v2

# Production
.env.production → NEXT_PUBLIC_FRONTEND_VERSION=v2
```

## 🐛 Troubleshooting

### Version not changing
- ✅ Restart dev server (Ctrl+C, then `npm run dev`)
- ✅ Check environment variable is set correctly
- ✅ Verify import path in `page.tsx`

### Import errors
- ✅ Check import paths use relative paths (`../shared/types`)
- ✅ Ensure shared types are not deleted
- ✅ Verify component exports match imports

### Build errors
- ✅ Run `npm run build` to catch TypeScript errors
- ✅ Check all versions compile, even if not active
- ✅ Ensure no circular dependencies

## 📖 Examples

### Creating v3 from Figma
1. Export Figma design to React components
2. Create `v3/index.tsx` and paste your main component
3. Create supporting components in `v3/` folder
4. Update imports to use `../shared/types`
5. Register in `page.tsx`
6. Test with `NEXT_PUBLIC_FRONTEND_VERSION=v3`

### Maintaining Multiple Versions
- Keep v1 for legacy support
- Use v2 for current production
- Develop v3 for next release
- Switch between them instantly via environment variable

---

**Last Updated**: December 2024
**Structure Version**: 2.0
