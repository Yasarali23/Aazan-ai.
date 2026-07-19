// components/chat-interface.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Message } from "./message";
import { ChatInput } from "./chat-input";
import { useChat } from "@/hooks/useChat";
import { Loader2 } from "lucide-react";

interface ChatInterfaceProps {
  chatId: string;
}

export function ChatInterface({ chatId }: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const { messages, isLoading, error, sendMessage, loadChat, stopStreaming } =
    useChat({
      chatId,
    });

  // Load chat on mount
  useEffect(() => {
    const init = async () => {
      await loadChat(chatId);
      setIsInitialLoading(false);
    };
    init();
  }, [chatId, loadChat]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (content: string, model: string) => {
    sendMessage(content, model);
  };

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Messages Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-primary scrollbar-track-transparent"
      >
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold text-foreground">
                Welcome to AAZAN AI
              </h2>
              <p className="text-muted-foreground max-w-md">
                Start a conversation with our AI assistant. Choose a model, ask
                anything, and get instant responses.
              </p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <Message
            key={message.id}
            role={message.role}
            content={message.content}
            isStreaming={message.isStreaming}
            timestamp={message.createdAt}
          />
        ))}

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card">
        <ChatInput
          onSend={handleSendMessage}
          isLoading={isLoading}
          onStop={stopStreaming}
        />
      </div>
    </div>
  );
}
