// components/agent-badge.tsx
"use client";

import { getAgentTemplate } from "@/lib/agent-templates";

interface AgentBadgeProps {
  agentId: string;
  onChangeAgent?: () => void;
}

export function AgentBadge({ agentId, onChangeAgent }: AgentBadgeProps) {
  const template = getAgentTemplate(agentId);

  if (!template) return null;

  return (
    <button
      onClick={onChangeAgent}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-lg hover:border-primary transition-all group"
    >
      <span className="text-lg">{template.icon}</span>
      <div className="text-left">
        <p className="text-xs text-muted-foreground">Specialist</p>
        <p className="text-sm font-semibold text-foreground">{template.name}</p>
      </div>
      <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
        ⚙️
      </span>
    </button>
  );
}
