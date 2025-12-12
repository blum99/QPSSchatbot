# Frontend Version Management - Visual Guide

## 🗂️ Folder Structure (Visual)

```
src/app/components/chat/
│
├── 📁 shared/                    ← Shared resources
│   └── types.ts                 ← Common TypeScript interfaces
│
├── 📁 v1/                        ← VERSION 1 (Complete & Isolated)
│   ├── index.tsx                ← Main component (exports ChatApp)
│   ├── ChatMessage.tsx          ← Message display
│   └── ConversationSidebar.tsx  ← Sidebar
│
├── 📁 v2/                        ← VERSION 2 (Complete & Isolated)
│   ├── index.tsx                ← Main component (exports ChatApp)
│   ├── ChatMessage.tsx          ← Message with markdown
│   ├── ConversationSidebar.tsx  ← Sidebar with folders
│   └── DocumentsContacts.tsx    ← Resources/Support view
│
└── 📁 v3/                        ← VERSION 3 (Template Ready)
    ├── index.tsx                ← Template (ready for Figma)
    └── README.md                ← Quick start guide
```

## 🔄 Version Switching Flow

```
┌─────────────────┐
│   .env.local    │
│  FRONTEND_      │
│  VERSION=v2     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   page.tsx      │
│  Reads env var  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Selects from:  │
│  v1: ChatAppV1  │
│  v2: ChatAppV2 ← Selected!
│  v3: ChatAppV3  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Loads v2/      │
│  index.tsx      │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Your screen    │
│  shows v2 UI    │
└─────────────────┘
```

## 🎯 Deletion Process (Safe!)

### Example: Delete v1

```
BEFORE:                          AFTER:
├── shared/                      ├── shared/
├── v1/ ← DELETE THIS           │   (unchanged)
├── v2/                          ├── v2/
└── v3/                          │   (unchanged)
                                 └── v3/
                                     (unchanged)

Result: v2 and v3 still work perfectly! ✅
```

### Steps:
1. `rm -rf src/app/components/chat/v1`
2. Remove v1 import from `page.tsx`
3. Remove `v1: ChatAppV1` from versions object
4. Done! No other changes needed.

## ➕ Creation Process

### Example: Create v4 from v2

```
STEP 1: Copy
├── v2/              ─┐
│   ├── index.tsx     │
│   ├── ChatMessage.tsx  │  COPY
│   ├── ConversationSidebar.tsx  │  ────→
│   └── DocumentsContacts.tsx   │
└── v4/              ─┘
    ├── index.tsx     ← Modified for v4
    ├── ChatMessage.tsx
    ├── ConversationSidebar.tsx
    └── DocumentsContacts.tsx

STEP 2: Register in page.tsx
import { ChatApp as ChatAppV4 } from "./components/chat/v4";
versions = {
  v1, v2, v3,
  v4: ChatAppV4  ← Add this
}

STEP 3: Activate
NEXT_PUBLIC_FRONTEND_VERSION=v4
```

## 🔗 Import Chain

```
v2/index.tsx
    │
    ├─→ import ChatMessage from "./ChatMessage"        (same folder)
    ├─→ import Sidebar from "./ConversationSidebar"    (same folder)
    ├─→ import Documents from "./DocumentsContacts"    (same folder)
    └─→ import { Message } from "../shared/types"      (shared)
         │
         └─→ shared/types.ts (Common types)

Result: v2 is self-contained except for shared types ✅
```

## 🎨 Typical Development Workflow

```
┌──────────────┐
│ Need new UI? │
└──────┬───────┘
       │
       ↓
┌─────────────────────────┐
│ 1. Copy v3 template to  │
│    your version folder  │
└───────────┬─────────────┘
            │
            ↓
┌─────────────────────────┐
│ 2. Add your Figma code  │
│    to index.tsx         │
└───────────┬─────────────┘
            │
            ↓
┌─────────────────────────┐
│ 3. Add any extra        │
│    components needed    │
└───────────┬─────────────┘
            │
            ↓
┌─────────────────────────┐
│ 4. Register in page.tsx │
└───────────┬─────────────┘
            │
            ↓
┌─────────────────────────┐
│ 5. Set env variable     │
│    to your version      │
└───────────┬─────────────┘
            │
            ↓
┌─────────────────────────┐
│ 6. Test & Iterate       │
└─────────────────────────┘
```

## 📊 Comparison: Before vs After

### BEFORE (Old Structure)
```
chat/
├── ChatApp-v1.tsx         ← v1 main
├── ChatApp-v2.tsx         ← v2 main
├── ChatMessage.tsx        ← Shared? Or v1? Unclear!
├── ConversationSidebar.tsx ← Shared? Or v1? Unclear!
├── DocumentsContacts.tsx  ← Only v2, but not obvious
└── types.ts               ← Shared

Problem: Mixed files, unclear ownership
Risk: Deleting affects multiple versions
```

### AFTER (New Structure)
```
chat/
├── shared/
│   └── types.ts           ← Clearly shared
├── v1/
│   ├── index.tsx          ← Clearly v1
│   ├── ChatMessage.tsx    ← Clearly v1
│   └── ConversationSidebar.tsx ← Clearly v1
└── v2/
    ├── index.tsx          ← Clearly v2
    ├── ChatMessage.tsx    ← Clearly v2
    ├── ConversationSidebar.tsx ← Clearly v2
    └── DocumentsContacts.tsx ← Clearly v2

Benefit: Clear ownership, safe deletion
Clear: Each version is isolated
```

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| **Switch to v1** | `NEXT_PUBLIC_FRONTEND_VERSION=v1` |
| **Switch to v2** | `NEXT_PUBLIC_FRONTEND_VERSION=v2` |
| **Switch to v3** | `NEXT_PUBLIC_FRONTEND_VERSION=v3` |
| **Create v4** | `cp -r v3 v4` + register in page.tsx |
| **Delete v1** | `rm -rf v1` + remove from page.tsx |
| **See all versions** | `ls src/app/components/chat/` |

## 🎓 Pro Tips

### ✅ DO:
- Keep each version self-contained
- Only share via `shared/` folder
- Delete old versions when confirmed obsolete
- Copy from existing version to start new one
- Read README.md for full documentation

### ❌ DON'T:
- Import from other version folders
- Share components between versions directly
- Modify shared types without considering all versions
- Mix version files in root folder

---

## 🎉 You're Ready!

With this structure, you can:
- ✅ Maintain multiple frontend versions
- ✅ Delete old versions safely
- ✅ Add new versions easily
- ✅ Work on different UIs independently
- ✅ Switch between versions instantly

**Need more details?** Check:
- `QUICK-START.md` - Quick tasks
- `chat/README.md` - Full documentation
- `v3/README.md` - v3 creation guide
