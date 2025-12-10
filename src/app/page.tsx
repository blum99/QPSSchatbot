'use client';

import { ChatApp as ChatAppV1 } from "./components/chat/ChatApp-v1";
import { ChatApp as ChatAppV2 } from "./components/chat/ChatApp-v2";

// Select version from environment variable or default to v2
const FRONTEND_VERSION = process.env.NEXT_PUBLIC_FRONTEND_VERSION || 'v2';

export default function Home() {
  // Version selector
  const versions = {
    v1: ChatAppV1,
    v2: ChatAppV2,
    // v3: ChatAppV3, // Add future versions here
  };

  const SelectedChatApp = versions[FRONTEND_VERSION as keyof typeof versions] || ChatAppV2;
  
  return <SelectedChatApp />;
}
