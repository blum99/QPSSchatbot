'use client';

import { ChatApp as ChatAppV1 } from "./components/chat/v1";
import { ChatApp as ChatAppV2 } from "./components/chat/v2";
import { ChatApp as ChatAppV3 } from "./components/chat/v3";

const frontendConfig = require('../../frontend.config.js');

export default function Home() {
  // Select version from config file (frontend.config.js)
  const FRONTEND_VERSION = frontendConfig.FRONTEND_VERSION || 'v2';
  
  // Version selector
  const versions = {
    v1: ChatAppV1,
    v2: ChatAppV2,
    v3: ChatAppV3,
  };

  const SelectedChatApp = versions[FRONTEND_VERSION as keyof typeof versions] || ChatAppV2;
  
  return <SelectedChatApp />;
}
