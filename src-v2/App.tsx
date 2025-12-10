import { useState, useRef, useEffect } from "react";
import { Send, Menu, X, MessageSquare, FolderOpen, User, LogOut, Settings, HelpCircle, ChevronDown } from "lucide-react";
import { ChatMessage, Message } from "./components/ChatMessage";
import { ConversationSidebar, Conversation } from "./components/ConversationSidebar";
import { DocumentsContacts } from "./components/DocumentsContacts";
import qpssIcon from "figma:asset/418f386bbd86f225babc6970a8e76c3523f173c9.png";

const initialMessages: Message[] = [
  {
    id: "1",
    text: "Hello! I'm your AI assistant. How can I help you today?",
    sender: "bot",
    timestamp: new Date(Date.now() - 60000),
  },
  {
    id: "2",
    text: "Hi! I'd like to know more about your capabilities.",
    sender: "user",
    timestamp: new Date(Date.now() - 45000),
  },
  {
    id: "3",
    text: "I can assist you with a wide range of tasks including answering questions, providing information, helping with problem-solving, and having natural conversations. What would you like to explore?",
    sender: "bot",
    timestamp: new Date(Date.now() - 30000),
  },
];

interface ConversationData {
  [key: string]: Message[];
}

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      title: "Getting Started",
      lastMessage: "I can assist you with a wide range of tasks...",
      timestamp: new Date(Date.now() - 30000),
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
  const [activeView, setActiveView] = useState<"chat" | "resources">("chat");
  const [dataSource, setDataSource] = useState<"health" | "pensions">("health");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [userName, setUserName] = useState("John Doe");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const activeMessages = conversationData[activeConversationId] || [];

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

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    // Update conversation data
    setConversationData((prev) => ({
      ...prev,
      [activeConversationId]: [...(prev[activeConversationId] || []), userMessage],
    }));

    // Update conversation preview
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

    // Simulate bot response
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
      // Don't delete the last conversation, just create a new one instead
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
      <div className="flex h-screen w-full bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-56" : "w-0"
        } transition-all duration-300 overflow-hidden`}
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
              <img src={qpssIcon} alt="QPSS" className="h-10 w-10 object-contain" />
            </div>
            <div className="flex-1">
              <h1 className="text-gray-900 dark:text-gray-100">QPSS Assistant</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-[12px]">Support assistant for the ILO/PENSIONS and ILO/HEALTH valuation systems</p>
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
            <div
              className="relative"
              ref={userMenuRef}
            >
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                  <User className="h-4 w-4" />
                </div>
                <span className="text-sm text-gray-900 dark:text-gray-100">{userName}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {userMenuOpen && (
                <div
                  className="absolute right-0 top-12 z-50 w-64 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white">
                        <User className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-gray-100">{userName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">john.doe@ilo.org</p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700"></div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        alert('Profile settings coming soon');
                      }}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Profile Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        alert('Help desk message feature coming soon');
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
                        setIsLoggedIn(false);
                        setUserMenuOpen(false);
                        alert('Logged out successfully');
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
                      <img src={qpssIcon} alt="QPSS" className="h-8 w-8 object-contain" />
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
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <DocumentsContacts theme={theme} />
        )}
      </div>
      </div>
    </div>
  );
}