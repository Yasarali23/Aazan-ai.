// components/agent-selector.tsx
"use client";

import { useState } from "react";
import { getAllAgents } from "@/lib/agent-templates";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentSelectorProps {
  onSelect: (agentId: string) => void;
  onClose: () => void;
  selectedAgent?: string;
}

export function AgentSelector({
  onSelect,
  onClose,
  selectedAgent,
}: AgentSelectorProps) {
  const agents = getAllAgents();

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-card">
          <div>
            <h2 className="text-xl font-bold">Choose AI Specialist</h2>
            <p className="text-sm text-muted-foreground">
              Select an AI expert to assist you
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => {
                onSelect(agent.id);
                onClose();
              }}
              className={cn(
                "p-4 rounded-lg border-2 transition-all text-left hover:shadow-lg",
                selectedAgent === agent.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary"
              )}
            >
              {/* Icon & Name */}
              <div className="flex items-start gap-3 mb-2">
                <div className="text-3xl">{agent.icon}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground">{agent.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {agent.description}
                  </p>
                </div>
              </div>

              {/* Tools */}
              <div className="flex flex-wrap gap-1">
                {agent.tools?.slice(0, 3).map((tool) => (
                  <span
                    key={tool}
                    className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground"
                  >
                    {tool}
                  </span>
                ))}
              </div>

              {/* Selected Badge */}
              {selectedAgent === agent.id && (
                <div className="mt-3 px-3 py-1 bg-primary text-white text-xs rounded-full w-fit">
                  ✓ Selected
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Info Footer */}
        <div className="sticky bottom-0 border-t border-border bg-muted/50 p-4 text-sm text-muted-foreground">
          <p>
            💡 Each specialist has optimized prompts for their domain. You can
            customize or create your own agents.
          </p>
        </div>
      </div>
    </div>
  );
}
