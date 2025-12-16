'use client';

import { ChatApp as ChatAppV1 } from "./components/chat/v1";
import { ChatApp as ChatAppV2 } from "./components/chat/v2";

const frontendConfig = require('../../frontend.config.js');

export default function Home() {
  // Select version from config file (frontend.config.js)
  const FRONTEND_VERSION = frontendConfig.FRONTEND_VERSION || 'v2';
  
  // Version selector
  const versions = {
    v1: ChatAppV1,
    v2: ChatAppV2,
  };

  const SelectedChatApp = versions[FRONTEND_VERSION as keyof typeof versions] || ChatAppV2;
  
  return <SelectedChatApp />;
}
