// components/message.tsx
"use client";

import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

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

  return (
    <div
      className={cn(
        "flex w-full mb-4 animate-in fade-in slide-in-from-bottom-2",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-3 transition-all",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-card text-card-foreground border border-border rounded-bl-none"
        )}
      >
        {/* Message Content */}
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  const language = match ? match[1] : "text";

                  if (inline) {
                    return (
                      <code
                        className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }

                  return (
                    <div className="relative my-4 rounded-lg overflow-hidden bg-black">
                      <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-border">
                        <span className="text-xs font-mono text-muted-foreground">
                          {language}
                        </span>
                        <button
                          onClick={() =>
                            copyToClipboard(String(children).replace(/\n$/, ""))
                          }
                          className="p-1 hover:bg-accent rounded transition-colors"
                        >
                          {copied ? (
                            <Check size={16} className="text-green-500" />
                          ) : (
                            <Copy size={16} className="text-muted-foreground" />
                          )}
                        </button>
                      </div>
                      <SyntaxHighlighter
                        style={atomDark}
                        language={language}
                        className="!bg-transparent !m-0 !p-4 text-sm"
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    </div>
                  );
                },
                a({ href, children }: any) {
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {children}
                    </a>
                  );
                },
                table({ children }: any) {
                  return (
                    <div className="overflow-x-auto my-4">
                      <table className="w-full border-collapse border border-border">
                        {children}
                      </table>
                    </div>
                  );
                },
                th({ children }: any) {
                  return (
                    <th className="border border-border bg-muted px-3 py-2 text-left font-semibold">
                      {children}
                    </th>
                  );
                },
                td({ children }: any) {
                  return (
                    <td className="border border-border px-3 py-2">
                      {children}
                    </td>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}

        {/* Streaming Indicator */}
        {isStreaming && !isUser && (
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <div className="animate-pulse">Thinking</div>
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
          <p className="text-xs text-muted-foreground mt-2 opacity-70">
            {new Date(timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}
