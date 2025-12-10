# Frontend Version Selector

This project supports multiple frontend implementations that can be switched dynamically via environment variable. This allows teams to develop, test, and deploy different UI layouts while maintaining the same backend infrastructure.

## 🎯 Quick Start

**To switch between frontend versions:**

1. **Edit `.env.local`**:
   ```bash
   NEXT_PUBLIC_FRONTEND_VERSION=v2  # Change to v1, v2, v3, etc.
   ```

2. **Restart the dev server**:
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

3. **Refresh your browser** at http://localhost:3000

## 📋 Available Versions

### v1 - Original Simple Layout
**Best for:** Minimal interface, quick responses, focus on conversation

**Features:**
- Basic sidebar with conversation list
- Simple header
- Chat messages
- Input box
- Lightweight and fast

**Use when:**
- You need maximum performance
- Testing core chatbot functionality
- Minimal UI requirements

---

### v2 - Figma Modern UI *(December 2024)*
**Best for:** Full-featured experience, data exploration, professional interface

**Features:**
- Enhanced sidebar with theme toggle (dark/light mode)
- **Data Source switcher**: Toggle between "ILO/Health" and "ILO/Pensions"
- **View switcher**: Switch between "Chat" and "Resources" modes
- User menu with profile and settings
- DocumentsContacts resource view
- Modern shadcn/ui components with Radix UI primitives
- Responsive design

**Use when:**
- Demonstrating to stakeholders
- Users need to switch between health and pension data
- Accessing document resources alongside chat
- Professional presentation required

---

### v3, v4, v5... - Future Versions
Future layouts can be added following the instructions below.

---

## 🔧 Adding New Versions

When you're ready to create v3, v4, or any future version:

### Step 1: Create Your New Component

Create a new file in the chat components folder:

```bash
src/app/components/chat/ChatApp-v3.tsx
```

**Template to start from:**
```typescript
'use client';

import { useState } from 'react';
// Import your components...

export function ChatApp() {
  // Your new UI implementation
  return (
    <div className="flex h-screen">
      {/* Your layout here */}
    </div>
  );
}
```

### Step 2: Register in page.tsx

Edit `src/app/page.tsx`:

```typescript
import { ChatApp as ChatAppV1 } from "./components/chat/ChatApp-v1";
import { ChatApp as ChatAppV2 } from "./components/chat/ChatApp-v2";
import { ChatApp as ChatAppV3 } from "./components/chat/ChatApp-v3"; // Add this

export default function Home() {
  const FRONTEND_VERSION = process.env.NEXT_PUBLIC_FRONTEND_VERSION || 'v2';
  
  const versions = {
    v1: ChatAppV1,
    v2: ChatAppV2,
    v3: ChatAppV3, // Add this
  };

  const SelectedChatApp = versions[FRONTEND_VERSION as keyof typeof versions] || ChatAppV2;
  
  return <SelectedChatApp />;
}
```

### Step 3: Activate Your New Version

Update `.env.local`:

```bash
NEXT_PUBLIC_FRONTEND_VERSION=v3
```

### Step 4: Restart and Test

```bash
npm run dev
# Then refresh browser at localhost:3000
```

---

---

## 📁 Project Structure

```
src/app/
├── page.tsx                           # Main entry - Version selector logic
├── components/
│   └── chat/
│       ├── ChatApp-v1.tsx            # Version 1: Original layout
│       ├── ChatApp-v2.tsx            # Version 2: Figma Modern UI
│       ├── ChatApp-v3.tsx            # Version 3: (future)
│       ├── ChatMessage.tsx           # Shared across all versions
│       ├── ConversationSidebar.tsx   # Shared across all versions
│       ├── DocumentsContacts.tsx     # Used by v2+
│       ├── SettingsMenu.tsx          # Used by v2+
│       └── types.ts                  # Shared TypeScript types
└── api/
    └── chat/
        └── route.ts                  # Backend API (same for all versions)
```

**Key Points:**
- `page.tsx` reads `NEXT_PUBLIC_FRONTEND_VERSION` and loads the correct component
- Each version is self-contained in its own `ChatApp-vX.tsx` file
- Shared components (like `ChatMessage`) can be reused across versions
- Backend API (`route.ts`) remains unchanged regardless of frontend version

---

## ⚠️ Important Notes

### Environment Variables
- Variable **must** start with `NEXT_PUBLIC_` to be accessible in the browser
- Changes require **full server restart** (not just hot reload)
- Default is `v2` if not specified

### Backend Compatibility
- All frontend versions use the **same** backend API endpoint (`/api/chat`)
- OpenAI Assistant integration is **shared** across all versions
- Conversations and data are **not affected** by switching versions
- Vector store configuration remains the same

### Development Workflow
1. **Create** new version in separate file (`ChatApp-vX.tsx`)
2. **Test** by switching environment variable
3. **Iterate** on your new design
4. **Deploy** by setting production environment variable

### Git Branches
- `main` - Production-ready code
- `figma-ui-MD` - Initial Figma integration work
- `multi-frontend-selector` - Version selector system (current)

---

## 🚀 Deployment Checklist

When deploying to production:

1. ✅ **Choose your default version** in production `.env`:
   ```bash
   NEXT_PUBLIC_FRONTEND_VERSION=v2
   ```

2. ✅ **Test locally** with that version before deploying

3. ✅ **Build the project** to check for errors:
   ```bash
   npm run build
   ```

4. ✅ **Set environment variables** in your hosting platform:
   - Vercel: Project Settings → Environment Variables
   - AWS/Azure: Application configuration
   - Docker: Pass via `-e` flag or compose file

5. ✅ **Document** which version is live for your team

---

## 💡 Tips & Best Practices

### For Developers
- **Keep versions isolated**: Each version should be self-contained
- **Share common components**: Use shared components for messages, sidebars, etc.
- **Maintain consistency**: Keep the same API contract across versions
- **Test switching**: Regularly test that all versions still work

### For Teams
- **Document changes**: Update this file when adding new versions
- **Communicate switches**: Let team know which version is active
- **Version naming**: Use semantic names (v1, v2, v3) or dates (v2024-12, v2025-01)
- **Preserve old versions**: Don't delete old versions until confirmed obsolete

### For Stakeholders
- **Easy demos**: Switch versions to show different options without code changes
- **A/B testing**: Deploy different versions to different environments
- **Gradual rollout**: Test new version with subset of users
- **Quick rollback**: Revert to previous version by changing one variable

---

## 🐛 Troubleshooting

### Version not changing after editing .env.local
- **Solution**: Restart the dev server (Ctrl+C, then `npm run dev`)
- Hot reload doesn't pick up environment variable changes

### "Cannot find module ChatApp-vX"
- **Solution**: Make sure you imported the component in `page.tsx`
- Check file path and export statement

### Hydration errors in console
- **Solution**: Ensure environment variable is read **inside** the component, not at module level
- See `page.tsx` for correct implementation

### Styles not loading
- **Solution**: Check `globals.css` has `@import "tailwindcss";`
- Verify Tailwind config is correct

### Port 3000 already in use
- **Solution**: `lsof -ti:3000 | xargs kill -9` then restart
- Or use the port Next.js suggests (e.g., 3001)

---

## 📞 Support

Questions about the version selector system? Check:
1. This documentation (FRONTEND-SELECTOR.md)
2. Main README.md for general setup
3. `.env.local` comments for configuration details
4. Git commit history for implementation details

---

**Last Updated**: December 2024  
**Current Versions**: v1 (original), v2 (Figma Modern UI)  
**Branch**: multi-frontend-selector
