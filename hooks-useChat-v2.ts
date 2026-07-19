// hooks/useChat-v2.ts (with agent support)
"use client";

import { useState, useCallback, useRef } from "react";
import { Message } from "@prisma/client";

interface UseChatOptions {
  chatId?: string;
  agentId?: string;
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
  const streamRef = useRef<AbortController | null>(null);

  // Load messages
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
  const loadChat = useCallback(
    async (chatId: string) => {
      try {
        const response = await fetch(`/api/chats/${chatId}`);

        if (!response.ok) {
          throw new Error("Failed to load chat");
        }

        const data = await response.json();
        await loadMessages(chatId);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
      }
    },
    [loadMessages]
  );

  // Send message with agent support
  const sendMessage = useCallback(
    async (
      content: string,
      model: string = "claude-sonnet",
      agentId?: string
    ) => {
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
          metadata: {
            agent: agentId,
          } as any,
          createdAt: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        options.onStreamStart?.();

        // Send to API
        const endpoint = agentId
          ? `/api/chats/${options.chatId}/messages/agent`
          : `/api/chats/${options.chatId}/messages`;

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content,
            model,
            agentId,
          }),
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
            metadata: { agent: agentId } as any,
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
    isLoading,
    error,
    sendMessage,
    loadMessages,
    loadChat,
    stopStreaming,
    clearMessages,
  };
}
