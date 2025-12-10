'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Menu, Send, X, MessageSquare, FolderOpen, User, Settings, HelpCircle, LogOut, ChevronDown } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ConversationSidebar } from "./ConversationSidebar";
import { DocumentsContacts } from "./DocumentsContacts";
import { Conversation, Message } from "./types";

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
  const [assistantError, setAssistantError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"chat" | "resources">("chat");
  const [dataSource, setDataSource] = useState<"health" | "pensions">("health");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userName] = useState("User");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

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
                  ? truncatePreview(trimmedInput, 30)
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

  return (
    <div className={`flex h-screen w-full bg-white dark:bg-gray-900 ${theme === "dark" ? "dark" : ""}`}>
      {/* Sidebar */}
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
          />
        </div>

        {/* Main Chat Area */}
        <div className="flex flex-1 flex-col">
          {/* Header */}
          <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80">
            <div className="flex items-center gap-3 px-4 py-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                <img src={qpssIconSrc} alt="QPSS" className="h-10 w-10 object-contain" />
              </div>
              <div className="flex-1">
                <h1 className="text-gray-900 dark:text-gray-100">QPSS Assistant</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-[12px]">
                  Support assistant for the ILO/PENSIONS and ILO/HEALTH valuation systems
                </p>
              </div>
              {/* Data Source Switcher */}
              <div className="flex flex-col items-start gap-1 mr-8">
                <span className="text-xs text-gray-500 dark:text-gray-400">Data Source</span>
                <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
                  <button
                    onClick={() => setDataSource("health")}
                    className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                      dataSource === "health"
                        ? "bg-green-600 text-white shadow-sm dark:bg-green-500"
                        : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    }`}
                  >
                    ILO/Health
                  </button>
                  <button
                    onClick={() => setDataSource("pensions")}
                    className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                      dataSource === "pensions"
                        ? "bg-purple-600 text-white shadow-sm dark:bg-purple-500"
                        : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    }`}
                  >
                    ILO/Pensions
                  </button>
                </div>
              </div>
              {/* View Switcher */}
              <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
                <button
                  onClick={() => setActiveView("chat")}
                  className={`flex items-center gap-2 rounded-md px-3 py-1.5 transition-colors ${
                    activeView === "chat"
                      ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm">Chat</span>
                </button>
                <button
                  onClick={() => setActiveView("resources")}
                  className={`flex items-center gap-2 rounded-md px-3 py-1.5 transition-colors ${
                    activeView === "resources"
                      ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                  }`}
                >
                  <FolderOpen className="h-4 w-4" />
                  <span className="text-sm">Resources</span>
                </button>
              </div>
              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-gray-900 dark:text-gray-100">{userName}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
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

          {/* Content Area */}
          {activeView === "chat" ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="mx-auto w-[80%] space-y-4">
                  {activeMessages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  {isTyping && (
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white">
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
                    <Send className="h-5 w-5" />
                  </button>
                </div>
                {assistantError && (
                  <p className="mx-auto mt-2 w-[80%] text-sm text-red-600 dark:text-red-400">
                    {assistantError}
                  </p>
                )}
              </div>
            </>
          ) : (
            <DocumentsContacts theme={theme} />
          )}
        </div>
    </div>
  );
}
