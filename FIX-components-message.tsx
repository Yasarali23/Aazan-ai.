// components/message.tsx - FIXED VERSION (NO EXTERNAL LIBS)
"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface MessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  timestamp?: Date;
}

export function Message({ role, content, isStreaming, timestamp }: MessageProps) {
  const [copied, setCopied] = useState(false);

  const isUser = role === "user";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple code block parser
  const renderContent = (text: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      const language = match[1] || "text";
      const code = match[2];

      parts.push(
        <div key={`code-${lastIndex}`} className="relative my-4 rounded-lg overflow-hidden bg-black">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
            <span className="text-xs font-mono text-slate-400">{language}</span>
            <button
              onClick={() => copyToClipboard(code.trim())}
              className="p-1 hover:bg-slate-700 rounded transition-colors"
              title="Copy code"
            >
              {copied ? (
                <Check size={16} className="text-green-500" />
              ) : (
                <Copy size={16} className="text-slate-400" />
              )}
            </button>
          </div>
          <pre className="p-4 overflow-x-auto">
            <code className="text-sm font-mono text-gray-100 whitespace-pre-wrap">
              {code.trim()}
            </code>
          </pre>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  };

  const content_parts = renderContent(content);

  return (
    <div
      className={`flex w-full mb-4 animate-in fade-in slide-in-from-bottom-2 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 transition-all ${
          isUser
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-none"
        }`}
      >
        {/* Message Content */}
        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {isUser ? (
            content
          ) : (
            <div className="space-y-2">
              {Array.isArray(content_parts) ? (
                content_parts.map((part, idx) =>
                  typeof part === "string" ? (
                    <span key={idx}>{part}</span>
                  ) : (
                    part
                  )
                )
              ) : (
                <span>{content}</span>
              )}
            </div>
          )}
        </div>

        {/* Streaming Indicator */}
        {isStreaming && !isUser && (
          <div className="flex items-center gap-1 mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="animate-pulse">Thinking</span>
            <div className="flex gap-0.5">
              <div className="w-1 h-1 bg-current rounded-full animate-bounce" />
              <div
                className="w-1 h-1 bg-current rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              />
              <div
                className="w-1 h-1 bg-current rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
            </div>
          </div>
        )}

        {/* Timestamp */}
        {timestamp && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 opacity-70">
            {new Date(timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}
