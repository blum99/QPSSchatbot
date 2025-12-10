'use client';

/**
 * Frontend Version Selector
 * Dynamically loads the ChatApp version based on frontend.config.js
 */

// Import all available versions
import { ChatApp as ChatAppV1 } from './ChatApp-v1';
import { ChatApp as ChatAppV2 } from './ChatApp-v2';

// This will be replaced at build time
const FRONTEND_VERSION = process.env.NEXT_PUBLIC_FRONTEND_VERSION || 'v2';

// Version map
const versions = {
  v1: ChatAppV1,
  v2: ChatAppV2,
  // v3: ChatAppV3, // Add future versions here
};

export function ChatApp() {
  const SelectedVersion = versions[FRONTEND_VERSION as keyof typeof versions] || versions.v2;
  
  return <SelectedVersion />;
}
