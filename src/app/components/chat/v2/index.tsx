'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Menu, ArrowUp, X, MessageSquare, FolderOpen, User, Settings, HelpCircle, LogOut, ChevronDown, Moon, Sun } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ConversationSidebar } from "./ConversationSidebar";
import { DocumentsContacts } from "./DocumentsContacts";
import { Conversation, Message, Folder } from "../shared/types";

const qpssIconSrc = "/chat/qpss-icon.png";

const INITIAL_CONVERSATION_ID = "conversation-initial";
const INITIAL_TIMESTAMP = new Date("2024-01-01T07:46:00Z");

interface ConversationData {
  [key: string]: Message[];
}

const INITIAL_WELCOME_MESSAGE: Message = {
  id: `${INITIAL_CONVERSATION_ID}-welcome`,
  text: "Hello! I'm your QPSS AI assistant. How can I help you today?",
  sender: "bot",
  timestamp: INITIAL_TIMESTAMP,
};

export function ChatApp() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: INITIAL_CONVERSATION_ID,
      title: "New Conversation",
      lastMessage: "Hello! I'm your QPSS AI assistant...",
      timestamp: INITIAL_TIMESTAMP,
      threadId: undefined,
    },
  ]);
  const [activeConversationId, setActiveConversationId] = useState(INITIAL_CONVERSATION_ID);
  const [conversationData, setConversationData] = useState<ConversationData>({
    [INITIAL_CONVERSATION_ID]: [INITIAL_WELCOME_MESSAGE],
  });
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [language, setLanguage] = useState<"English" | "Français" | "Español" | "Português">("English");
  const [assistantError, setAssistantError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"chat" | "resources" | "support">("chat");
  const [dataSource, setDataSource] = useState<"auto" | "health" | "pensions" | "ssi" | "rap">("auto");
  const [modelLocked, setModelLocked] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userName] = useState("User");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [folders, setFolders] = useState<Folder[]>([]);

  const activeMessages = conversationData[activeConversationId] || [];

  const truncatePreview = (text: string, maxLength = 50) => {
    if (text.length <= maxLength) {
      return text;
    }
    return `${text.substring(0, maxLength)}...`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages, isTyping]);

  // Close user menu when clicking outside
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

  const handleSend = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isTyping) {
      return;
    }

    // Lock the model after sending first message
    if (!modelLocked) {
      setModelLocked(true);
    }

    const targetConversationId = activeConversationId;
    const currentConversation = conversations.find((conv) => conv.id === targetConversationId);
    const timestamp = new Date();
    const userMessage: Message = {
      id: `${Date.now()}`,
      text: trimmedInput,
      sender: "user",
      timestamp,
    };

    setAssistantError(null);
    setConversationData((prev) => ({
      ...prev,
      [targetConversationId]: [...(prev[targetConversationId] || []), userMessage],
    }));

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === targetConversationId
          ? {
              ...conv,
              title:
                conv.title === "New Conversation"
                  ? `${dataSource === "auto" ? "AUTO" : dataSource === "health" ? "Health" : dataSource === "pensions" ? "Pension" : dataSource === "ssi" ? "SSI" : "RAP"}-${truncatePreview(trimmedInput, 30)}`
                  : conv.title,
              lastMessage: truncatePreview(trimmedInput),
              timestamp,
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
          message: trimmedInput,
          threadId: currentConversation?.threadId,
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
      const assistantMessage: Message = {
        id: `${Date.now()}-bot`,
        text: data.reply || "", // fallback to empty string to avoid undefined UI state
        sender: "bot",
        timestamp: new Date(),
      };

      setConversationData((prev) => ({
        ...prev,
        [targetConversationId]: [...(prev[targetConversationId] || []), assistantMessage],
      }));

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === targetConversationId
            ? {
                ...conv,
                threadId: data.threadId ?? conv.threadId,
                lastMessage: truncatePreview(assistantMessage.text),
                timestamp: assistantMessage.timestamp,
              }
            : conv
        )
      );
    } catch (error) {
      console.error("Failed to send message", error);
      setAssistantError(
        error instanceof Error ? error.message : "Unexpected error sending message"
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleNewConversation = () => {
    const newId = Date.now().toString();
    const welcomeMessage: Message = {
      id: `${newId}-1`,
      text: "Hello! I'm your AI assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    };

    setConversations((prev) => [
      {
        id: newId,
        title: "New Conversation",
        lastMessage: "Hello! I'm your AI assistant...",
        timestamp: new Date(),
        threadId: undefined,
      },
      ...prev,
    ]);

    setConversationData((prev) => ({
      ...prev,
      [newId]: [welcomeMessage],
    }));

    setActiveConversationId(newId);
    setModelLocked(false); // Reset model lock for new conversation
    setIsTyping(false);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setAssistantError(null);
    setIsTyping(false);
  };

  const handleDeleteConversation = (id: string) => {
    if (conversations.length === 1) {
      handleNewConversation();
    }

    setConversations((prev) => {
      const updated = prev.filter((conv) => conv.id !== id);
      if (activeConversationId === id && updated.length > 0) {
        setActiveConversationId(updated[0].id);
      }
      return updated;
    });
    setConversationData((prev) => {
      const newData = { ...prev };
      delete newData[id];
      return newData;
    });

  };

  const handleCreateFolder = (name: string) => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name,
      createdAt: new Date(),
      isExpanded: true,
    };
    setFolders((prev) => [...prev, newFolder]);
  };

  const handleDeleteFolder = (folderId: string) => {
    // Move all conversations in this folder back to ungrouped
    setConversations((prev) =>
      prev.map((conv) =>
        conv.folderId === folderId ? { ...conv, folderId: undefined } : conv
      )
    );
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
  };

  const handleToggleFolder = (folderId: string) => {
    setFolders((prev) =>
      prev.map((f) =>
        f.id === folderId ? { ...f, isExpanded: !f.isExpanded } : f
      )
    );
  };

  const handleMoveToFolder = (conversationId: string, folderId: string | null) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, folderId: folderId || undefined } : conv
      )
    );
  };

  const handleRenameFolder = (folderId: string, newName: string) => {
    setFolders((prev) =>
      prev.map((f) =>
        f.id === folderId ? { ...f, name: newName } : f
      )
    );
  };

  return (
    <div className={`flex h-screen w-full flex-col bg-white dark:bg-gray-900 ${theme === "dark" ? "dark" : ""}`}>
      {/* Header - Spans Full Width */}
      <div className="relative overflow-visible bg-[#230050]" style={{ fontFamily: "'Overpass', sans-serif" }}>
            <div className="flex items-center gap-3 px-4 py-4">
              <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white">
                <img src={qpssIconSrc} alt="QPSS" className="h-10 w-10 object-contain" />
              </div>
              <div className="flex-1">
                <h1 className="font-bold text-white">QPSS Assistant</h1>
                <p className="text-sm text-[#EBF5FD] opacity-70">
                  ILO Modelling & Analysis Support Assistant
                </p>
              </div>
              {/* View Switcher */}
              <div className="flex gap-1 rounded-lg bg-[#3a0070] p-1">
                <button
                  onClick={() => setActiveView("chat")}
                  className={`flex items-center gap-2 rounded-md px-3 py-1.5 transition-colors ${
                    activeView === "chat"
                      ? "bg-white text-[#230050] shadow-sm"
                      : "text-[#EBF5FD] hover:text-white"
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm">Chat</span>
                </button>
                <button
                  onClick={() => setActiveView("resources")}
                  className={`flex items-center gap-2 rounded-md px-3 py-1.5 transition-colors ${
                    activeView === "resources"
                      ? "bg-white text-[#230050] shadow-sm"
                      : "text-[#EBF5FD] hover:text-white"
                  }`}
                >
                  <FolderOpen className="h-4 w-4" />
                  <span className="text-sm">Resources</span>
                </button>
                <button
                  onClick={() => setActiveView("support")}
                  className={`flex items-center gap-2 rounded-md px-3 py-1.5 transition-colors ${
                    activeView === "support"
                      ? "bg-white text-[#230050] shadow-sm"
                      : "text-[#EBF5FD] hover:text-white"
                  }`}
                >
                  <HelpCircle className="h-4 w-4" />
                  <span className="text-sm">Support</span>
                </button>
              </div>
              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-[#EBF5FD] transition-colors hover:bg-[#3a0070]"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-white">{userName}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-12 z-[100] w-64 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <div className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white">
                          <User className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-gray-900 dark:text-gray-100">{userName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">user@ilo.org</p>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700"></div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Profile Settings</span>
                      </button>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
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

      {/* Main Content Area with Sidebar and Chat */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - only show in Chat view */}
        {activeView === "chat" && (
          <div
            className={`${sidebarOpen ? "w-56" : "w-0"} transition-all duration-300 overflow-hidden`}
          >
            <ConversationSidebar
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={handleSelectConversation}
              onNewConversation={handleNewConversation}
              onDeleteConversation={handleDeleteConversation}
              theme={theme}
              onThemeChange={setTheme}
              language={language}
              onLanguageChange={setLanguage}
              onToggleSidebar={() => setSidebarOpen(false)}
              folders={folders}
              onCreateFolder={handleCreateFolder}
              onDeleteFolder={handleDeleteFolder}
              onToggleFolder={handleToggleFolder}
              onMoveToFolder={handleMoveToFolder}
              onRenameFolder={handleRenameFolder}
            />
          </div>
        )}

        {/* Main Chat/Resources Area */}
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col relative overflow-hidden">
            {/* Floating Open Sidebar Button - only shows when sidebar is closed */}
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-gray-600 shadow-md transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            {/* Content Area */}
            {activeView === "chat" ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto bg-white px-4 py-6 dark:bg-gray-900">
                <div className="mx-auto w-[80%] space-y-4">
                  {activeMessages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  {isTyping && (
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white dark:bg-gray-800">
                        <img src={qpssIconSrc} alt="QPSS" className="h-8 w-8 object-contain" />
                      </div>
                      <div className="flex items-center gap-1 rounded-2xl bg-gray-100 px-4 py-3 dark:bg-gray-800">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s] dark:bg-gray-500"></div>
                        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s] dark:bg-gray-500"></div>
                        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500"></div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-4 dark:border-gray-700 dark:bg-gray-900/80">
                {/* Model Selector or Confirmation */}
                {!modelLocked ? (
                  <div className="mx-auto mb-3 flex w-[80%] items-center gap-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Model:</span>
                    <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
                      <button
                        onClick={() => setDataSource("auto")}
                        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                          dataSource === "auto"
                            ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400"
                            : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                        }`}
                      >
                        AUTO
                      </button>
                      <button
                        onClick={() => setDataSource("health")}
                        className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                          dataSource === "health"
                            ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400"
                            : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                        }`}
                      >
                        ILO/Health
                      </button>
                      <button
                        onClick={() => setDataSource("pensions")}
                        className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                          dataSource === "pensions"
                            ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400"
                            : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                        }`}
                      >
                        ILO/Pension
                      </button>
                      <button
                        onClick={() => setDataSource("ssi")}
                        className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                          dataSource === "ssi"
                            ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400"
                            : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                        }`}
                      >
                        ILO/SSI
                      </button>
                      <button
                        onClick={() => setDataSource("rap")}
                        className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                          dataSource === "rap"
                            ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400"
                            : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                        }`}
                      >
                        ILO/RAP
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mx-auto mb-3 w-[80%] text-sm text-gray-600 dark:text-gray-400">
                    You are now sourcing information from the{" "}
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {dataSource === "auto" ? "AUTO" : dataSource === "health" ? "ILO/Health" : dataSource === "pensions" ? "ILO/Pension" : dataSource === "ssi" ? "ILO/SSI" : "ILO/RAP"}
                    </span>
                    {" "}guidebook.
                  </div>
                )}
                <div className="mx-auto flex w-[80%] gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 rounded-full border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition-all placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-800"
                  />
                  <button
                    onClick={() => void handleSend()}
                    disabled={!inputValue.trim() || isTyping}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    <ArrowUp className="h-5 w-5" />
                  </button>
                </div>
                {assistantError && (
                  <p className="mx-auto mt-2 w-[80%] text-sm text-red-600 dark:text-red-400">
                    {assistantError}
                  </p>
                )}
              </div>
            </>
          ) : activeView === "resources" ? (
            <DocumentsContacts theme={theme} onThemeChange={setTheme} language={language} onLanguageChange={setLanguage} showDocumentsOnly={true} />
          ) : (
            <DocumentsContacts theme={theme} onThemeChange={setTheme} language={language} onLanguageChange={setLanguage} showDocumentsOnly={false} />
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
