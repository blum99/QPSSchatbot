import { User } from "lucide-react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";

export interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  timeZone: "UTC", // keep SSR/CSR output stable
});

const markdownComponents: Components = {
  h1: ({ node: _node, children, ...props }) => (
    <h1 className="text-lg font-semibold leading-tight" {...props}>
      {children}
    </h1>
  ),
  h2: ({ node: _node, children, ...props }) => (
    <h2 className="text-base font-semibold leading-tight" {...props}>
      {children}
    </h2>
  ),
  h3: ({ node: _node, children, ...props }) => (
    <h3 className="text-base font-medium leading-tight" {...props}>
      {children}
    </h3>
  ),
  p: ({ node: _node, children, ...props }) => (
    <p className="mb-2 last:mb-0 leading-relaxed" {...props}>
      {children}
    </p>
  ),
  strong: ({ node: _node, children, ...props }) => (
    <strong className="font-semibold" {...props}>
      {children}
    </strong>
  ),
  em: ({ node: _node, children, ...props }) => (
    <em className="italic" {...props}>
      {children}
    </em>
  ),
  a: ({ node: _node, children, ...props }) => (
    <a
      className="underline decoration-dashed decoration-current underline-offset-2 hover:opacity-80"
      target="_blank"
      rel="noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
  ul: ({ node: _node, children, ...props }) => (
    <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0" {...props}>
      {children}
    </ul>
  ),
  ol: ({ node: _node, children, ...props }) => (
    <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0" {...props}>
      {children}
    </ol>
  ),
  li: ({ node: _node, children, ...props }) => (
    <li className="leading-relaxed" {...props}>
      {children}
    </li>
  ),
  blockquote: ({ node: _node, children, ...props }) => (
    <blockquote className="my-3 border-l-2 border-current/40 pl-3 italic first:mt-0 last:mb-0" {...props}>
      {children}
    </blockquote>
  ),
  code({ node: _node, inline, children, className, ...props }) {
    if (inline) {
      return (
        <code className="rounded bg-black/10 px-1 py-0.5 text-sm" {...props}>
          {children}
        </code>
      );
    }
    return (
      <pre className="mb-2 mt-2 overflow-x-auto rounded-lg bg-black/80 p-3 text-sm text-white last:mb-0">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    );
  },
};

export function ChatMessage({ message }: ChatMessageProps) {
  const isBot = message.sender === "bot";

  return (
    <div className={`flex gap-3 ${isBot ? "" : "flex-row-reverse"}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isBot ? "bg-white shadow-sm" : "bg-gray-200 dark:bg-gray-700"
        }`}
      >
        {isBot ? (
          <Image src="/chat/qpss-icon.png" alt="QPSS" width={24} height={24} className="object-contain" />
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
        <div className="text-sm leading-relaxed [&>*:last-child]:mb-0">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
            skipHtml
          >
            {message.text}
          </ReactMarkdown>
        </div>
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