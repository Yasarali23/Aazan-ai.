// components/chat-input.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Mic, StopCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const MODELS = [
  { id: "claude-sonnet", name: "Claude Sonnet", provider: "Anthropic" },
  { id: "claude-opus", name: "Claude Opus", provider: "Anthropic" },
  { id: "gpt-4", name: "GPT-4", provider: "OpenAI" },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo", provider: "OpenAI" },
  { id: "gemini-pro", name: "Gemini Pro", provider: "Google" },
];

interface ChatInputProps {
  onSend: (message: string, model: string) => void;
  isLoading?: boolean;
  onStop?: () => void;
}

export function ChatInput({ onSend, isLoading = false, onStop }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("claude-sonnet");
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(
        textareaRef.current.scrollHeight,
        200
      ) + "px";
    }
  }, [input]);

  // Close model selector on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        modelButtonRef.current &&
        !modelButtonRef.current.contains(e.target as Node) &&
        showModelSelector
      ) {
        setShowModelSelector(false);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [showModelSelector]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSend(input, selectedModel);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentModel = MODELS.find((m) => m.id === selectedModel);

  return (
    <div className="w-full space-y-3">
      {/* Model Selector */}
      <div className="flex items-center gap-2 px-4">
        <div className="relative" ref={modelButtonRef}>
          <button
            onClick={() => setShowModelSelector(!showModelSelector)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-card border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <span className="text-xs text-muted-foreground">
              {currentModel?.provider}
            </span>
            <span>{currentModel?.name}</span>
            <svg
              className={cn(
                "w-4 h-4 transition-transform",
                showModelSelector && "rotate-180"
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>

          {/* Model Dropdown */}
          {showModelSelector && (
            <div className="absolute bottom-full mb-2 w-56 bg-card border border-border rounded-lg shadow-lg z-50">
              {MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    setSelectedModel(model.id);
                    setShowModelSelector(false);
                  }}
                  className={cn(
                    "w-full px-4 py-3 text-left text-sm transition-colors border-b border-border last:border-b-0",
                    selectedModel === model.id
                      ? "bg-primary/10 text-primary font-semibold"
                      : "hover:bg-muted"
                  )}
                >
                  <div className="font-medium">{model.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {model.provider}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="flex items-end gap-3 px-4 pb-4">
        {/* File Upload */}
        <button
          disabled={isLoading}
          className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
        >
          <Paperclip size={20} className="text-muted-foreground" />
        </button>

        {/* Textarea */}
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything... (Shift + Enter for new line)"
            disabled={isLoading}
            className={cn(
              "w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
              "resize-none transition-all max-h-[200px] min-h-[48px]",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          />
        </div>

        {/* Voice Input */}
        <button
          onClick={() => setIsVoiceActive(!isVoiceActive)}
          disabled={isLoading}
          className={cn(
            "p-2 rounded-lg transition-colors disabled:opacity-50",
            isVoiceActive ? "bg-accent text-accent-foreground" : "hover:bg-muted"
          )}
        >
          <Mic
            size={20}
            className={isVoiceActive ? "animate-pulse" : "text-muted-foreground"}
          />
        </button>

        {/* Send / Stop Button */}
        <button
          onClick={isLoading ? onStop : handleSend}
          disabled={isLoading ? false : !input.trim()}
          className={cn(
            "p-2 rounded-lg transition-all",
            isLoading
              ? "bg-destructive hover:bg-destructive/90 text-white"
              : "bg-primary hover:bg-primary/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <StopCircle size={20} />
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>

      {/* Helper Text */}
      <div className="text-xs text-muted-foreground text-center pb-2">
        {isLoading ? "AI is thinking..." : "Type your question or command"}
      </div>
    </div>
  );
}
