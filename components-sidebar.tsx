// components/sidebar.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Pin, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Chat } from "@prisma/client";

interface SidebarProps {
  currentChatId?: string;
  onNewChat: () => void;
}

export function Sidebar({ currentChatId, onNewChat }: SidebarProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Load chats
  useEffect(() => {
    const loadChats = async () => {
      try {
        const response = await fetch("/api/chats");
        if (response.ok) {
          const data = await response.json();
          setChats(data.data || []);
        }
      } catch (error) {
        console.error("Failed to load chats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChats();
  }, []);

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm("Delete this chat?")) {
      try {
        await fetch(`/api/chats/${chatId}`, { method: "DELETE" });
        setChats(chats.filter((c) => c.id !== chatId));
      } catch (error) {
        console.error("Failed to delete chat:", error);
      }
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 md:hidden p-2 hover:bg-muted rounded-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          "h-screen bg-card border-r border-border flex flex-col transition-all duration-300",
          isOpen ? "w-64" : "w-0 md:w-64 md:block",
          "fixed md:relative z-30 md:z-auto"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <Plus size={20} />
            New Chat
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              Loading chats...
            </div>
          ) : chats.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              No chats yet
            </div>
          ) : (
            chats.map((chat) => (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                className={cn(
                  "block p-3 rounded-lg transition-all group",
                  currentChatId === chat.id
                    ? "bg-primary/10 border border-primary text-primary"
                    : "hover:bg-muted border border-transparent text-foreground"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{chat.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {new Date(chat.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      className="p-1 hover:bg-accent rounded transition-colors"
                      title="Pin chat"
                    >
                      <Pin size={14} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      className="p-1 hover:bg-destructive hover:text-white rounded transition-colors"
                      title="Delete chat"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Premium Plan</span>
            <span>∞ Messages</span>
          </div>
          <div className="flex justify-between">
            <span>Models Available</span>
            <span>5+</span>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-20"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
