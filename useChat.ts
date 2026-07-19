// hooks/useChat.ts
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Message, Chat } from "@prisma/client";

interface UseChatOptions {
  chatId?: string;
  onStreamStart?: () => void;
  onStreamEnd?: () => void;
}

interface ChatMessage extends Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function useChat(options: UseChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const streamRef = useRef<AbortController | null>(null);

  // Load chat messages
  const loadMessages = useCallback(async (chatId: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/chats/${chatId}/messages`);

      if (!response.ok) {
        throw new Error("Failed to load messages");
      }

      const data = await response.json();
      setMessages(data.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    }
  }, []);

  // Load single chat
  const loadChat = useCallback(async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`);

      if (!response.ok) {
        throw new Error("Failed to load chat");
      }

      const data = await response.json();
      setChat(data.data);
      await loadMessages(chatId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    }
  }, [loadMessages]);

  // Send message with streaming
  const sendMessage = useCallback(
    async (content: string, model: string = "claude-sonnet") => {
      if (!content.trim()) return;
      if (!options.chatId) return;

      try {
        setIsLoading(true);
        setError(null);

        // Add user message optimistically
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          chatId: options.chatId,
          role: "user",
          content,
          tokens: null,
          isStreaming: false,
          metadata: null,
          createdAt: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        options.onStreamStart?.();

        // Send to API
        const response = await fetch(`/api/chats/${options.chatId}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        });

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        // Handle streaming response
        if (response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let assistantContent = "";

          // Add assistant message placeholder
          const assistantMessage: ChatMessage = {
            id: Date.now().toString() + "1",
            chatId: options.chatId,
            role: "assistant",
            content: "",
            tokens: null,
            isStreaming: true,
            metadata: null,
            createdAt: new Date(),
          };

          setMessages((prev) => [...prev, assistantMessage]);

          try {
            while (true) {
              const { done, value } = await reader.read();

              if (done) break;

              const chunk = decoder.decode(value);
              assistantContent += chunk;

              // Update streaming message
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessage.id
                    ? { ...msg, content: assistantContent }
                    : msg
                )
              );
            }

            // Mark as complete
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessage.id
                  ? { ...msg, isStreaming: false }
                  : msg
              )
            );
          } catch (err) {
            if (err instanceof Error && err.name === "AbortError") {
              console.log("Stream aborted");
            } else {
              throw err;
            }
          } finally {
            options.onStreamEnd?.();
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        setIsLoading(false);
      }
    },
    [options]
  );

  // Stop streaming
  const stopStreaming = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.abort();
      streamRef.current = null;
    }
  }, []);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    chat,
    isLoading,
    error,
    sendMessage,
    loadMessages,
    loadChat,
    stopStreaming,
    clearMessages,
  };
}
