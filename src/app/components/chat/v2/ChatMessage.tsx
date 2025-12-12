import { User } from "lucide-react";
import { Message } from "./types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const qpssIconSrc = "/chat/qpss-icon.png";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isBot = message.sender === "bot";

  return (
    <div className={`flex gap-3 ${isBot ? "" : "flex-row-reverse"}`}>
      <div
        className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full ${
          isBot ? "bg-white dark:bg-white" : "bg-gray-200 dark:bg-gray-700"
        }`}
      >
        {isBot ? (
          <img src={qpssIconSrc} alt="QPSS" className="h-8 w-8 object-contain" />
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
        <div className="markdown-content">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              // Text formatting
              p: ({children}) => <p className="mb-3 last:mb-0">{children}</p>,
              strong: ({children}) => <strong className="font-bold">{children}</strong>,
              em: ({children}) => <em className="italic">{children}</em>,
              del: ({children}) => <del className="line-through">{children}</del>,
              
              // Lists
              ul: ({children}) => <ul className="mb-3 ml-4 list-disc space-y-1">{children}</ul>,
              ol: ({children}) => <ol className="mb-3 ml-4 list-decimal space-y-1">{children}</ol>,
              li: ({children}) => <li className="ml-0">{children}</li>,
              
              // Headings
              h1: ({children}) => <h1 className="mb-2 mt-3 text-xl font-bold first:mt-0">{children}</h1>,
              h2: ({children}) => <h2 className="mb-2 mt-3 text-lg font-bold first:mt-0">{children}</h2>,
              h3: ({children}) => <h3 className="mb-2 mt-3 text-base font-bold first:mt-0">{children}</h3>,
              h4: ({children}) => <h4 className="mb-2 mt-3 text-sm font-bold first:mt-0">{children}</h4>,
              h5: ({children}) => <h5 className="mb-2 mt-3 text-sm font-bold first:mt-0">{children}</h5>,
              h6: ({children}) => <h6 className="mb-2 mt-3 text-sm font-bold first:mt-0">{children}</h6>,
              
              // Code
              code: ({inline, children, ...props}: any) => 
                inline ? (
                  <code className="rounded bg-gray-200 px-1 py-0.5 text-sm dark:bg-gray-700" {...props}>
                    {children}
                  </code>
                ) : (
                  <code className="block overflow-x-auto rounded bg-gray-200 p-2 text-sm dark:bg-gray-700" {...props}>
                    {children}
                  </code>
                ),
              pre: ({children}) => <pre className="mb-3 overflow-x-auto">{children}</pre>,
              
              // Blockquote
              blockquote: ({children}) => (
                <blockquote className="mb-3 border-l-4 border-gray-300 pl-3 italic dark:border-gray-600">
                  {children}
                </blockquote>
              ),
              
              // Links
              a: ({children, href}) => (
                <a href={href} className="underline hover:no-underline" target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
              
              // Tables
              table: ({children}) => (
                <table className="mb-3 w-full border-collapse border border-gray-300 dark:border-gray-600">
                  {children}
                </table>
              ),
              thead: ({children}) => <thead className="bg-gray-200 dark:bg-gray-700">{children}</thead>,
              tbody: ({children}) => <tbody>{children}</tbody>,
              tr: ({children}) => <tr className="border-b border-gray-300 dark:border-gray-600">{children}</tr>,
              th: ({children}) => (
                <th className="border border-gray-300 px-3 py-2 text-left font-bold dark:border-gray-600">
                  {children}
                </th>
              ),
              td: ({children}) => (
                <td className="border border-gray-300 px-3 py-2 dark:border-gray-600">
                  {children}
                </td>
              ),
              
              // Horizontal rule
              hr: () => <hr className="my-4 border-gray-300 dark:border-gray-600" />,
              
              // Line break
              br: () => <br className="block h-2" />,
              
              // Task lists
              input: ({checked, ...props}: any) => (
                <input
                  type="checkbox"
                  checked={checked}
                  disabled
                  className="mr-2"
                  {...props}
                />
              ),
            }}
          >
            {message.text}
          </ReactMarkdown>
        </div>
        <span
          className={`mt-1 block text-xs ${
            isBot ? "text-gray-500 dark:text-gray-400" : "text-blue-100 dark:text-blue-200"
          }`}
          suppressHydrationWarning
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