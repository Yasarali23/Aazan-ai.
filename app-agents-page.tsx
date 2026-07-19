// app/agents/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, ToggleRight, ToggleLeft } from "lucide-react";
import { AGENT_TEMPLATES } from "@/lib/agent-templates";
import { cn } from "@/lib/utils";

interface Agent {
  id: string;
  type: string;
  name: string;
  description: string;
  enabled: boolean;
  createdAt: Date;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Load agents
  useEffect(() => {
    const loadAgents = async () => {
      try {
        const response = await fetch("/api/agents");
        if (response.ok) {
          const data = await response.json();
          setAgents(data.data || []);
        }
      } catch (error) {
        console.error("Failed to load agents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAgents();
  }, []);

  const handleCreateAgent = async (templateId: string) => {
    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: templateId }),
      });

      if (response.ok) {
        const data = await response.json();
        setAgents([...agents, data.data]);
        setShowCreateModal(false);
        setSelectedTemplate(null);
      }
    } catch (error) {
      console.error("Failed to create agent:", error);
    }
  };

  const handleToggleAgent = async (agentId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !enabled }),
      });

      if (response.ok) {
        setAgents(
          agents.map((a) =>
            a.id === agentId ? { ...a, enabled: !enabled } : a
          )
        );
      }
    } catch (error) {
      console.error("Failed to toggle agent:", error);
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm("Delete this agent?")) return;

    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAgents(agents.filter((a) => a.id !== agentId));
      }
    } catch (error) {
      console.error("Failed to delete agent:", error);
    }
  };

  const templates = Object.values(AGENT_TEMPLATES);
  const usedTemplates = new Set(agents.map((a) => a.type));

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              AI Specialists
            </h1>
            <p className="text-muted-foreground">
              Create and manage your personal AI experts
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(!showCreateModal)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold"
          >
            <Plus size={20} />
            Create Specialist
          </button>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-card">
                <h2 className="text-2xl font-bold">
                  {selectedTemplate
                    ? "Review Template"
                    : "Choose AI Specialist"}
                </h2>
              </div>

              {/* Content */}
              <div className="p-6">
                {!selectedTemplate ? (
                  /* Template Selection */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        disabled={usedTemplates.has(template.id)}
                        className={cn(
                          "p-4 rounded-lg border-2 transition-all text-left",
                          usedTemplates.has(template.id)
                            ? "border-muted bg-muted/50 opacity-50 cursor-not-allowed"
                            : "border-border hover:border-primary cursor-pointer hover:shadow-lg"
                        )}
                      >
                        <div className="text-4xl mb-2">{template.icon}</div>
                        <h3 className="font-bold text-lg mb-1">
                          {template.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {template.description}
                        </p>
                        {usedTemplates.has(template.id) && (
                          <span className="text-xs text-muted-foreground">
                            Already created
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  /* Confirmation */
                  <div className="space-y-4">
                    {selectedTemplate && AGENT_TEMPLATES[selectedTemplate] && (
                      <>
                        <div className="p-6 bg-muted rounded-lg">
                          <div className="text-6xl mb-4">
                            {AGENT_TEMPLATES[selectedTemplate].icon}
                          </div>
                          <h3 className="text-2xl font-bold mb-2">
                            {AGENT_TEMPLATES[selectedTemplate].name}
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            {AGENT_TEMPLATES[selectedTemplate].description}
                          </p>
                          <div className="space-y-2">
                            <p className="font-semibold">Capabilities:</p>
                            <div className="flex flex-wrap gap-2">
                              {AGENT_TEMPLATES[selectedTemplate].tools.map(
                                (tool) => (
                                  <span
                                    key={tool}
                                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                                  >
                                    {tool}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => setSelectedTemplate(null)}
                            className="flex-1 px-4 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
                          >
                            Back
                          </button>
                          <button
                            onClick={() =>
                              handleCreateAgent(selectedTemplate)
                            }
                            className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                          >
                            Create Specialist
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Agents List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading specialists...
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No specialists yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Create Your First Specialist
              </button>
            </div>
          ) : (
            agents.map((agent) => {
              const template = AGENT_TEMPLATES[agent.type];
              return (
                <div
                  key={agent.id}
                  className="p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4 flex-1">
                      <div className="text-4xl">{template?.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{agent.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {agent.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Created{" "}
                          {new Date(agent.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleToggleAgent(agent.id, agent.enabled)
                        }
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title={agent.enabled ? "Disable" : "Enable"}
                      >
                        {agent.enabled ? (
                          <ToggleRight className="text-green-500" size={20} />
                        ) : (
                          <ToggleLeft
                            className="text-muted-foreground"
                            size={20}
                          />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteAgent(agent.id)}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2
                          className="text-destructive"
                          size={20}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Available Templates */}
        {agents.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Available Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates
                .filter((t) => !usedTemplates.has(t.id))
                .map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      setShowCreateModal(true);
                    }}
                    className="p-4 bg-card border border-border rounded-lg hover:border-primary hover:shadow-lg transition-all text-left group"
                  >
                    <div className="text-4xl mb-2">{template.icon}</div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
