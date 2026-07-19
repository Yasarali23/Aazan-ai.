// app/chat/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageSquare, Sparkles } from "lucide-react";

const FEATURES = [
  {
    icon: "🤖",
    title: "Multiple AI Models",
    description: "Choose from Claude, GPT-4, and more",
  },
  {
    icon: "⚡",
    title: "Lightning Fast",
    description: "Real-time streaming responses",
  },
  {
    icon: "🧠",
    title: "Smart Memory",
    description: "Remember context across conversations",
  },
  {
    icon: "🔒",
    title: "Private & Secure",
    description: "End-to-end encrypted conversations",
  },
];

export default function ChatPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleNewChat = async () => {
    setIsCreating(true);
    try {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Chat",
          model: "claude-sonnet",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/chat/${data.data.id}`);
      }
    } catch (error) {
      console.error("Failed to create chat:", error);
      setIsCreating(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center overflow-auto">
      <div className="max-w-2xl w-full px-6 py-12 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl">
            <Sparkles size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            Welcome to AAZAN AI
          </h1>
          <p className="text-xl text-muted-foreground">
            The Intelligent AI Super Assistant for Everyone
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleNewChat}
          disabled={isCreating}
          className="w-full py-4 px-6 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
        >
          {isCreating ? "Creating..." : "Start New Chat"}
        </button>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="p-4 rounded-lg bg-card border border-border hover:border-primary transition-colors"
            >
              <div className="text-3xl mb-2">{feature.icon}</div>
              <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
              <p className="text-xs text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="space-y-4">
          <h2 className="font-semibold text-foreground">Quick Tips</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Type your question or command in the input field</p>
            <p>• Use Shift + Enter to write multiple lines</p>
            <p>• Switch between AI models anytime</p>
            <p>• All conversations are automatically saved</p>
          </div>
        </div>
      </div>
    </div>
  );
}
