# Frontend Version Integration Guide

This guide documents the standard process for integrating new Figma-exported frontend versions into the Next.js application.

## Pre-Integration Checklist

When a new frontend version (e.g., v4, v5) is uploaded from Figma:

1. **Confirm upload location**: New version files should be in `/src/app/components/chat/vX/` folder
2. **Identify source framework**: Check if it's a Vite React app or other framework
3. **Ask user about connections needed**:
   - "Should I connect this version to the backend API?"
   - "Are there PDF downloads that need to be linked?"
   - "Should I preserve any existing features from other versions?"

## Standard Conversion Steps

### 1. File Structure Analysis

**Check for:**
- `package.json` (Vite-specific dependencies)
- `vite.config.ts` or similar build configs
- `index.html` (Vite entry point)
- `src/` folder structure
- Asset imports (especially Figma assets)

**Action:** If Vite artifacts exist, plan to remove them after conversion.

### 2. Convert Components to Next.js

#### A. Add "use client" Directive
All interactive components MUST have:
```tsx
"use client";
```
at the very top of the file.

#### B. Fix Image Imports
**Find:** 
```tsx
import iconName from "figma:asset/...png";
```

**Replace with:**
```tsx
import Image from "next/image";
```

**Update JSX:**
```tsx
// OLD (Figma/Vite)
<img src={iconName} alt="Icon" className="h-6 w-6" />

// NEW (Next.js)
<Image src="/path/to/icon.png" alt="Icon" width={24} height={24} className="object-contain" />
```

**Common icon paths:**
- QPSS logo: `/chat/qpss-icon.png` (located at `/public/chat/qpss-icon.png`)
- Other assets: Check `/public/` folder structure

#### C. Fix TypeScript Imports
**Import shared types:**
```tsx
import type { Message, Conversation, Folder } from "../shared/types";
```

**Never duplicate type definitions** - always import from shared types.

#### D. Fix React 19 + react-dnd Compatibility
For drag-and-drop refs:
```tsx
// Add type imports
import type { DragSourceMonitor, DropTargetMonitor } from "react-dnd";

// Cast refs with 'as any'
const [{ isDragging }, drag] = useDrag(...);
const [{ isOver }, drop] = useDrop(...);

<div ref={drag as any}>...</div>
<div ref={drop as any}>...</div>
```

### 3. Connect to Backend API

#### A. Replace Dummy Responses
**Find:**
```tsx
const handleSend = () => {
  // ...
  setTimeout(() => {
    const botMessage = { text: "Demo response..." };
    // ...
  }, 1000);
};
```

**Replace with:**
```tsx
const handleSend = async () => {
  if (!inputValue.trim()) return;
  
  // ... add user message to state ...
  
  setInputValue("");
  setIsTyping(true);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: inputValue,
        threadId: conversations.find((c) => c.id === activeConversationId)?.threadId,
      }),
    });

    const data = (await response.json().catch(() => ({}))) as {
      threadId?: string;
      reply?: string;
      error?: string;
    };

    if (!response.ok) {
      throw new Error(data?.error || "Assistant response failed");
    }

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: data.reply || "",
      sender: "bot",
      timestamp: new Date(),
    };

    setConversationData((prev) => ({
      ...prev,
      [activeConversationId]: [...(prev[activeConversationId] || []), botMessage],
    }));

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversationId
          ? {
              ...conv,
              threadId: data.threadId ?? conv.threadId,
              lastMessage: botMessage.text.substring(0, 50) + (botMessage.text.length > 50 ? "..." : ""),
              timestamp: new Date(),
            }
          : conv
      )
    );
  } catch (error) {
    console.error("Error sending message:", error);
    const errorMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: "Sorry, I encountered an error. Please try again.",
      sender: "bot",
      timestamp: new Date(),
    };

    setConversationData((prev) => ({
      ...prev,
      [activeConversationId]: [...(prev[activeConversationId] || []), errorMessage],
    }));
  } finally {
    setIsTyping(false);
  }
};
```

**Critical:** Make sure the function is marked as `async`!

#### B. Verify threadId Support
Check that `Conversation` interface includes:
```tsx
interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  threadId?: string;  // ← This is required
  folderId?: string;
}
```

### 4. Connect PDF Downloads

#### A. Add filename Property
Update interfaces:
```tsx
export interface Document {
  id: string;
  name: string;
  size: string;
  type: string;
  model: string;
  filename: string;  // ← Add this
}

export interface Publication {
  id: string;
  title: string;
  // ... other fields ...
  filename: string;  // ← Add this
}
```

#### B. Map Filenames to Actual PDFs
Check what PDFs exist:
- Guidebooks: `/public/resources/pdfs/guidebooks/`
- Publications: `/public/resources/pdfs/publications/`

Update data arrays:
```tsx
const documents: Document[] = [
  {
    id: "1",
    name: "ILO Health Manual (English)",
    size: "11",
    type: "Manual",
    model: "ILO/Health",
    filename: "ILO_Health_en.pdf",  // ← Match actual file
  },
  // ...
];
```

#### C. Implement Download Handlers
**Replace alert() placeholders:**
```tsx
const handleDownloadGuidebook = (doc: Document) => {
  const link = document.createElement('a');
  link.href = `/resources/pdfs/guidebooks/${doc.filename}`;
  link.download = doc.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const handleDownloadDocument = (pub: Publication) => {
  const link = document.createElement('a');
  link.href = `/resources/pdfs/publications/${pub.filename}`;
  link.download = pub.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
```

### 5. Fix Common Hydration Issues

#### A. Avoid Dynamic Timestamps in Initial State
**Problem:**
```tsx
const initialMessages: Message[] = [
  {
    timestamp: new Date(Date.now() - 60000),  // ❌ Different on server vs client
  },
];
```

**Solution:**
```tsx
// Use a fixed timestamp constant
const INITIAL_TIMESTAMP = new Date('2024-01-01T12:00:00Z');

const initialMessages: Message[] = [
  {
    timestamp: INITIAL_TIMESTAMP,  // ✅ Same on server and client
  },
];
```

#### B. Avoid Browser APIs in Initial Render
Don't use in component body:
- `window.*`
- `document.*` (except in useEffect)
- `localStorage` / `sessionStorage`
- `Date.now()` for initial state

### 6. Handle Model Selectors (Version-Specific)

**v3 Pattern:**
- Guidebooks tab: Has model selector (filters by model)
- Publications tab: No model selector (shows all)
- Trainings tab: No model selector (shows all)

**Implementation:**
```tsx
// Separate state for each filtered tab
const [selectedGuidebookModel, setSelectedGuidebookModel] = useState<ModelType>("ILO/Health");

// Only filter guidebooks
const filteredDocuments = documents.filter((doc) => doc.model === selectedGuidebookModel);

// Show all publications
const allPublications = publications;  // No filtering

// Conditional model selector
{activeTab === "Guidebooks" && (
  <div className="model-selector">
    {models.map((model) => (
      <button onClick={() => setSelectedGuidebookModel(model)}>
        {model}
      </button>
    ))}
  </div>
)}
```

### 7. Cleanup Vite Artifacts

After conversion is complete, remove:
- `/package.json` (if Vite-specific, different from root package.json)
- `/vite.config.ts` or `/vite-v2.config.ts`
- `/index.html` (Vite entry point)
- `/src/` folder (if it's a duplicate Vite source)
- Any `-old` or backup files

**Command:**
```bash
rm -f package.json vite.config.ts index.html
rm -rf src/
```

### 8. Testing Checklist

Before marking integration complete:

- [ ] Dev server starts without errors (`npm run dev`)
- [ ] No hydration warnings in browser console
- [ ] Images/icons display correctly
- [ ] Can send messages and receive responses from backend
- [ ] PDF downloads work (test at least one guidebook and one publication)
- [ ] Model selector filters correctly (if applicable)
- [ ] Drag-and-drop works (if applicable)
- [ ] Theme switching works (if applicable)
- [ ] No TypeScript errors in the files
- [ ] Switch to new version in `.env.local` and verify it loads

## Common Errors & Solutions

### Error: "Code generation for chunk item errored"
**Cause:** Figma asset import still present
**Solution:** 
1. Search for `figma:asset` in all files
2. Replace with Next.js Image import
3. Update JSX to use `<Image>` component

### Error: "await isn't allowed in non-async function"
**Cause:** Function making API call is missing `async` keyword
**Solution:** Add `async` to function signature:
```tsx
const handleSend = async () => {  // ← Add 'async'
  const response = await fetch(...);
}
```

### Error: "Cannot find module './types'"
**Cause:** Importing from wrong path or duplicating types
**Solution:** Use shared types:
```tsx
import type { Message, Conversation, Folder } from "../shared/types";
```

### Error: Type mismatch with react-dnd refs
**Cause:** React 19 ref types incompatible with react-dnd types
**Solution:** Cast with `as any`:
```tsx
<div ref={drag as any}>...</div>
```

### Error: Hydration mismatch
**Cause:** Using `Date.now()`, `Math.random()`, or browser APIs in initial render
**Solution:** Use fixed values or move to `useEffect`:
```tsx
// Fixed timestamp for initial state
const INITIAL_TIMESTAMP = new Date('2024-01-01T12:00:00Z');

// Or use useEffect for client-only values
useEffect(() => {
  setCurrentTime(Date.now());
}, []);
```

### Warning: Image with missing width/height
**Cause:** Next.js Image requires dimensions
**Solution:** Always specify:
```tsx
<Image src="..." alt="..." width={24} height={24} />
```

## Post-Integration Updates

### Update .env.local
To test the new version:
```bash
NEXT_PUBLIC_FRONTEND_VERSION=v3  # Change to v4, v5, etc.
```

**Note:** Must restart dev server after changing .env.local

### Document New Features
If the new version has unique features (e.g., model locking, resizable sidebar), document them in:
- `FRONTEND-MIGRATION.md` - Migration notes
- `FRONTEND-SELECTOR.md` - Feature comparison

## Integration Workflow

**Recommended sequence:**

1. User uploads new Figma version
2. **Ask user:** "I can see the new version files. Should I:
   - Connect it to the backend API?
   - Link PDF downloads?
   - Preserve any features from other versions?"
3. Perform conversion steps (1-7 above)
4. Run tests (step 8)
5. Ask user to test: "Integration complete. Please test by setting `NEXT_PUBLIC_FRONTEND_VERSION=vX` in `.env.local` and restarting the dev server. Let me know if you find any issues."

## Version-Specific Notes

### v1
- Simple chat interface
- No sidebar
- Basic backend integration

### v2
- Added conversation sidebar
- Drag-and-drop folders
- Settings menu

### v3
- Purple header (#2D1B69)
- Resizable sidebar (200-500px)
- Model locking system (AUTO, ILO/Health, ILO/Pension, ILO/SSI, ILO/RAP)
- Three-tab navigation (Chat, Resources, Support)
- Model selector only on Guidebooks tab
- PDF downloads for guidebooks and publications

### v4+ (Template)
- [Document key features]
- [Document unique interactions]
- [Document backend requirements]

---

**Last Updated:** December 12, 2025
**Applies To:** Next.js 16.x with React 19.x and Turbopack
