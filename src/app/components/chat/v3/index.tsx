"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp, User, LogOut, Settings as SettingsIcon, FileText, ChevronDown, ChevronRight, HelpCircle } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ConversationSidebar } from "./ConversationSidebar";
import { DocumentsContacts } from "./DocumentsContacts";
import { Support } from "./Support";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Image from "next/image";
import type { Message, Conversation, Folder } from "../shared/types";

// Use a fixed timestamp to avoid hydration mismatch
const INITIAL_TIMESTAMP = new Date('2024-01-01T12:00:00Z');

const initialMessages: Message[] = [
  {
    id: "1",
    text: "Hello! I'm your QPSS AI assistant. How can I help you today?",
    sender: "bot",
    timestamp: INITIAL_TIMESTAMP,
  },
];

interface ConversationData {
  [key: string]: Message[];
}

interface ConversationModelData {
  [key: string]: {
    model: ModelType;
    locked: boolean;
  };
}

type ModelType = "AUTO" | "ILO/HEALTH" | "ILO/PENSION" | "ILO/SSI" | "ILO/RAP";

export function ChatApp() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      title: "New Conversation",
      lastMessage: "Hello! I'm your QPSS AI assistant...",
      timestamp: INITIAL_TIMESTAMP,
    },
  ]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeConversationId, setActiveConversationId] = useState("1");
  const [conversationData, setConversationData] = useState<ConversationData>({
    "1": initialMessages,
  });
  const [conversationModelData, setConversationModelData] = useState<ConversationModelData>({
    "1": {
      model: "AUTO",
      locked: false,
    },
  });
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isResizing, setIsResizing] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [language, setLanguage] = useState("en");
  const [activeView, setActiveView] = useState<"chat" | "resources" | "support">("chat");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userName, setUserName] = useState("User");
  const [selectedGuidebookModel, setSelectedGuidebookModel] = useState<Exclude<ModelType, "AUTO">>("ILO/PENSION");
  const [isClient, setIsClient] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Ensure component only fully renders on client to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  const activeMessages = conversationData[activeConversationId] || [];
  const currentConversationModel = conversationModelData[activeConversationId] || { model: "AUTO" as ModelType, locked: false };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages, isTyping]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuOpen]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = e.clientX;
      if (newWidth >= 200 && newWidth <= 500) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    if (!currentConversationModel.locked) {
      setConversationModelData((prev) => ({
        ...prev,
        [activeConversationId]: {
          model: currentConversationModel.model,
          locked: true,
        },
      }));

      const modelPrefix = currentConversationModel.model === "AUTO" 
        ? "AUTO" 
        : currentConversationModel.model.split("/")[1];
      
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId
            ? {
                ...conv,
                title: `${modelPrefix}-${inputValue.substring(0, 30)}${inputValue.length > 30 ? "..." : ""}`,
              }
            : conv
        )
      );
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setConversationData((prev) => ({
      ...prev,
      [activeConversationId]: [...(prev[activeConversationId] || []), userMessage],
    }));

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversationId
          ? {
              ...conv,
              lastMessage: inputValue.substring(0, 50) + (inputValue.length > 50 ? "..." : ""),
              timestamp: new Date(),
            }
          : conv
      )
    );

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

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId
            ? {
                ...conv,
                lastMessage: errorMessage.text.substring(0, 50) + "...",
                timestamp: new Date(),
              }
            : conv
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewConversation = () => {
    const newId = Date.now().toString();
    const welcomeMessage: Message = {
      id: `${newId}-1`,
      text: "Hello! I'm your QPSS AI assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    };

    setConversations((prev) => [
      {
        id: newId,
        title: "New Conversation",
        lastMessage: "Hello! I'm your QPSS AI assistant...",
        timestamp: new Date(),
      },
      ...prev,
    ]);

    setConversationData((prev) => ({
      ...prev,
      [newId]: [welcomeMessage],
    }));

    setConversationModelData((prev) => ({
      ...prev,
      [newId]: {
        model: "AUTO",
        locked: false,
      },
    }));

    setActiveConversationId(newId);
    setIsTyping(false);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setIsTyping(false);
  };

  const handleDeleteConversation = (id: string) => {
    if (conversations.length === 1) {
      handleNewConversation();
    }

    setConversations((prev) => prev.filter((conv) => conv.id !== id));
    setConversationData((prev) => {
      const newData = { ...prev };
      delete newData[id];
      return newData;
    });

    setConversationModelData((prev) => {
      const newData = { ...prev };
      delete newData[id];
      return newData;
    });

    if (activeConversationId === id) {
      const remainingConvs = conversations.filter((conv) => conv.id !== id);
      if (remainingConvs.length > 0) {
        setActiveConversationId(remainingConvs[0].id);
      }
    }
  };

  const handleCreateFolder = (name: string) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name,
      createdAt: new Date(),
      isExpanded: true,
    };
    setFolders((prev) => [...prev, newFolder]);
  };

  const handleDeleteFolder = (id: string) => {
    setFolders((prev) => prev.filter((folder) => folder.id !== id));
    setConversations((prev) =>
      prev.map((conv) =>
        conv.folderId === id ? { ...conv, folderId: undefined } : conv
      )
    );
  };

  const handleToggleFolder = (id: string) => {
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === id ? { ...folder, isExpanded: !folder.isExpanded } : folder
      )
    );
  };

  const handleMoveConversationToFolder = (conversationId: string, folderId: string | null) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId
          ? { ...conv, folderId: folderId || undefined }
          : conv
      )
    );
  };

  const handleRenameFolder = (id: string, name: string) => {
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === id ? { ...folder, name } : folder
      )
    );
  };

  const handleModelSelect = (model: ModelType) => {
    if (!currentConversationModel.locked) {
      setConversationModelData((prev) => ({
        ...prev,
        [activeConversationId]: {
          ...prev[activeConversationId],
          model: model,
        },
      }));
    }
  };

  const handleOpenResources = () => {
    // Determine which tool to select in Resources
    const currentModel = currentConversationModel.model;
    
    // If AUTO or not locked, default to ILO/PENSION
    // Otherwise use the committed tool
    if (currentModel === "AUTO" || !currentConversationModel.locked) {
      setSelectedGuidebookModel("ILO/PENSION");
    } else {
      setSelectedGuidebookModel(currentModel as Exclude<ModelType, "AUTO">);
    }
    
    setActiveView("resources");
  };

  const models: ModelType[] = ["AUTO", "ILO/HEALTH", "ILO/PENSION", "ILO/SSI", "ILO/RAP"];

  return (
    <DndProvider backend={HTML5Backend}>
      <div suppressHydrationWarning className={`flex h-screen flex-col overflow-hidden ${theme === "dark" ? "dark" : ""}`}>
        <div className="flex h-full flex-col bg-white dark:bg-[#1A1F2E]">
          {/* Header - Deep Purple - Full Width */}
          <div className="bg-[#2D1B69] px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left: Logo and Title */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                  <Image src="/chat/qpss-icon.png" alt="QPSS" width={32} height={32} className="object-contain" />
                </div>
                <div>
                  <h1 className="text-white">QPSS Assistant</h1>
                  <p className="text-xs text-purple-200">
                    ILO Modelling & Analysis Support Assistant
                  </p>
                </div>
              </div>

              {/* Right: Navigation Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveView("chat")}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors ${
                    activeView === "chat"
                      ? "bg-white text-purple-900"
                      : "text-white hover:bg-purple-800"
                  }`}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  Chat
                </button>
                <button
                  onClick={() => setActiveView("resources")}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors ${
                    activeView === "resources"
                      ? "bg-white text-purple-900"
                      : "text-white hover:bg-purple-800"
                  }`}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z" />
                  </svg>
                  Resources
                </button>
                <button
                  onClick={() => setActiveView("support")}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors ${
                    activeView === "support"
                      ? "bg-white text-purple-900"
                      : "text-white hover:bg-purple-800"
                  }`}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  Support
                </button>

                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-white transition-colors hover:bg-purple-800"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="text-sm">{userName}</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-12 z-50 w-64 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                      <div className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white">
                            <User className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-gray-900 dark:text-gray-100">{userName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              john.doe@ilo.org
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700"></div>
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            alert("Profile settings coming soon");
                          }}
                          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                          <SettingsIcon className="h-4 w-4" />
                          <span>Profile Settings</span>
                        </button>
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            alert("Help desk message feature coming soon");
                          }}
                          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                          <HelpCircle className="h-4 w-4" />
                          <span>Contact Help Desk</span>
                        </button>
                      </div>
                      <div className="border-t border-gray-200 p-2 dark:border-gray-700">
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            alert("Logged out successfully");
                          }}
                          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area with Sidebar */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar - Only show in chat view */}
            {activeView === "chat" && sidebarOpen && (
              <>
                <div
                  style={{ width: `${sidebarWidth}px` }}
                  className="relative flex-shrink-0 overflow-hidden"
                >
                  <ConversationSidebar
                    conversations={conversations}
                    folders={folders}
                    activeConversationId={activeConversationId}
                    onSelectConversation={handleSelectConversation}
                    onNewConversation={handleNewConversation}
                    onDeleteConversation={handleDeleteConversation}
                    theme={theme}
                    onThemeChange={setTheme}
                    language={language}
                    onLanguageChange={setLanguage}
                    onCreateFolder={handleCreateFolder}
                    onDeleteFolder={handleDeleteFolder}
                    onToggleFolder={handleToggleFolder}
                    onMoveConversationToFolder={handleMoveConversationToFolder}
                    onRenameFolder={handleRenameFolder}
                    onToggleSidebar={() => setSidebarOpen(false)}
                  />
                </div>
                
                {/* Resize Handle */}
                <div
                  onMouseDown={() => setIsResizing(true)}
                  className="w-1 cursor-col-resize bg-gray-200 transition-colors hover:bg-blue-400 dark:bg-gray-700 dark:hover:bg-blue-600"
                  aria-label="Resize sidebar"
                />
              </>
            )}

            {/* Main Content */}
            <div className="flex flex-1 flex-col">
              {/* Content Area */}
              {activeView === "chat" ? (
                <>
                  {/* Open Sidebar Button */}
                  {!sidebarOpen && (
                    <div className="border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-[#1A1F2E]">
                      <button
                        onClick={() => setSidebarOpen(true)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800"
                        aria-label="Open sidebar"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  )}

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto bg-white px-4 py-6 dark:bg-[#1A1F2E]">
                    <div className="mx-auto max-w-4xl space-y-4">
                      {activeMessages.map((message) => (
                        <ChatMessage key={message.id} message={message} />
                      ))}
                      {isTyping && (
                        <div className="flex gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                            <Image src="/chat/qpss-icon.png" alt="QPSS" width={24} height={24} className="object-contain" />
                          </div>
                          <div className="flex items-center gap-1 rounded-2xl bg-gray-100 px-4 py-3">\n                            <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></div>
                            <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></div>
                            <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  {/* Input Area */}
                  <div className="border-t border-gray-200 bg-white px-4 py-4 dark:border-gray-700 dark:bg-[#4A5568]">
                    <div className="mx-auto max-w-4xl">
                      {/* Model Selector or Locked Message */}
                      {!currentConversationModel.locked ? (
                        <div className="mb-3 flex items-center gap-2">
                          <span className="text-sm text-gray-600 dark:text-gray-300">Tool:</span>
                          <div className="flex gap-2">
                            {models.map((model) => (
                              <button
                                key={model}
                                onClick={() => handleModelSelect(model)}
                                className={`rounded-full px-3 py-1 text-sm transition-colors ${
                                  currentConversationModel.model === model
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                                }`}
                              >
                                {model}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="mb-3 text-sm text-gray-600 dark:text-gray-300">
                          {currentConversationModel.model === "AUTO" ? (
                            <>
                              You are now sourcing information in{" "}
                              <span className="text-blue-600 dark:text-blue-400">AUTO</span> mode. Sources are
                              automatically selected based on the conversation.
                            </>
                          ) : (
                            <>
                              You are now sourcing information from the{" "}
                              <span className="text-blue-600 dark:text-blue-400">
                                {currentConversationModel.model}
                              </span>{" "}
                              guidebook.
                            </>
                          )}
                        </div>
                      )}

                      {/* Input Box */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Type your message..."
                          className="flex-1 rounded-full border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                        />
                        <button
                          onClick={handleSend}
                          disabled={!inputValue.trim()}
                          className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <ArrowUp className="h-5 w-5" />
                        </button>
                        {/* Help Button - to the right of Send */}
                        <button
                          onClick={handleOpenResources}
                          className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-200 text-gray-700 transition-all hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                          aria-label="Open Resources"
                        >
                          <FileText className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : activeView === "resources" ? (
                <DocumentsContacts 
                  theme={theme} 
                  onThemeChange={setTheme} 
                  language={language} 
                  onLanguageChange={setLanguage}
                  selectedGuidebookModel={selectedGuidebookModel}
                  onSelectedGuidebookModelChange={setSelectedGuidebookModel}
                />
              ) : (
                <Support theme={theme} onThemeChange={setTheme} language={language} onLanguageChange={setLanguage} />
              )}
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
