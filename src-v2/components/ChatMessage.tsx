import { Bot, User } from "lucide-react";
import qpssIcon from "figma:asset/418f386bbd86f225babc6970a8e76c3523f173c9.png";

export interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isBot = message.sender === "bot";

  return (
    <div className={`flex gap-3 ${isBot ? "" : "flex-row-reverse"}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isBot ? "bg-white" : "bg-gray-200 dark:bg-gray-700"
        }`}
      >
        {isBot ? (
          <img src={qpssIcon} alt="QPSS" className="h-8 w-8 object-contain" />
        ) : (
          <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        )}
      </div>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2 ${
          isBot
            ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
            : "bg-blue-600 text-white dark:bg-blue-500"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.text}</p>
        <span
          className={`mt-1 block text-xs ${
            isBot ? "text-gray-500 dark:text-gray-400" : "text-blue-100 dark:text-blue-200"
          }`}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}