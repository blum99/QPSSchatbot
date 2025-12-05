'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Menu, Send, X } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ConversationSidebar } from "./ConversationSidebar";
import { Conversation, Message } from "./types";

const qpssIconSrc = "/chat/qpss-icon.png";

const initialMessages: Message[] = [
  {
    id: "1",
    text: "Hello! I'm your AI assistant. How can I help you today?",
    sender: "bot",
    timestamp: new Date("2024-01-01T07:46:00Z"),
  },
  {
    id: "2",
    text: "Hi! I'd like to know more about your capabilities.",
    sender: "user",
    timestamp: new Date("2024-01-01T07:47:00Z"),
  },
  {
    id: "3",
    text: "I can assist you with a wide range of tasks including answering questions, providing information, helping with problem-solving, and having natural conversations. What would you like to explore?",
    sender: "bot",
    timestamp: new Date("2024-01-01T07:48:00Z"),
  },
];

interface ConversationData {
  [key: string]: Message[];
}

export function ChatApp() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      title: "Getting Started",
      lastMessage: "I can assist you with a wide range of tasks...",
      timestamp: new Date("2024-01-01T07:48:00Z"),
    },
  ]);
  const [activeConversationId, setActiveConversationId] = useState("1");
  const [conversationData, setConversationData] = useState<ConversationData>({
    "1": initialMessages,
  });
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeMessages = conversationData[activeConversationId] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

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

    // Demo typing indicator; real backend hookup will replace this.
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thanks for your message! This is a demo response. In a real application, this would be connected to an AI backend.",
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
                lastMessage: botMessage.text.substring(0, 50) + "...",
                timestamp: new Date(),
              }
            : conv
        )
      );

      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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

    if (activeConversationId === id) {
      const remainingConvs = conversations.filter((conv) => conv.id !== id);
      if (remainingConvs.length > 0) {
        setActiveConversationId(remainingConvs[0].id);
      }
    }
  };

  return (
    <div className={`flex h-screen ${theme === "dark" ? "dark" : ""}`}>
      <div className="flex h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        {/* Sidebar */}
        <div
          className={`${sidebarOpen ? "w-80" : "w-0"} transition-all duration-300 overflow-hidden`}
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
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-gray-800">
                <img src={qpssIconSrc} alt="QPSS" className="h-10 w-10 object-contain" />
              </div>
              <div>
                <h1 className="text-gray-900 dark:text-gray-100">QPSS Assistant</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-[12px]">
                  Support assistant for the ILO/PENSIONS and ILO/HEALTH valuation systems
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="mx-auto max-w-4xl space-y-4">
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
            <div className="mx-auto flex max-w-4xl gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 rounded-full border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition-all placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-800"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
