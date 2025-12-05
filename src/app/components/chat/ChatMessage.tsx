import { User } from "lucide-react";
import { Message } from "./types";

const qpssIconSrc = "/chat/qpss-icon.png";
const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  timeZone: "UTC",
});

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isBot = message.sender === "bot";

  return (
    <div className={`flex gap-3 ${isBot ? "" : "flex-row-reverse"}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isBot ? "bg-white dark:bg-gray-800" : "bg-gray-200 dark:bg-gray-700"
        }`}
      >
        {isBot ? (
          <img src={qpssIconSrc} alt="QPSS" className="h-8 w-8 object-contain" />
        ) : (
          <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        )}
      </div>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
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
          {timeFormatter.format(message.timestamp)}
        </span>
      </div>
    </div>
  );
}