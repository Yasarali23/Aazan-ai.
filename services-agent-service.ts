// services/agent-service.ts
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api-response";
import { AGENT_TEMPLATES } from "@/lib/agent-templates";

interface CreateAgentInput {
  userId: string;
  type: string;
  name?: string;
  systemPrompt?: string;
}

interface UpdateAgentInput {
  agentId: string;
  userId: string;
  name?: string;
  systemPrompt?: string;
  enabled?: boolean;
}

export class AgentService {
  // Get all agents for user
  async getUserAgents(userId: string) {
    try {
      const agents = await prisma.agent.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      return agents.map((agent) => {
        const template = AGENT_TEMPLATES[agent.type];
        return {
          ...agent,
          template,
        };
      });
    } catch (error) {
      throw new ApiError(500, "Failed to fetch agents");
    }
  }

  // Get single agent
  async getAgent(agentId: string, userId: string) {
    try {
      const agent = await prisma.agent.findUnique({
        where: { id: agentId },
      });

      if (!agent) {
        throw new ApiError(404, "Agent not found");
      }

      if (agent.userId !== userId) {
        throw new ApiError(403, "Unauthorized access to agent");
      }

      const template = AGENT_TEMPLATES[agent.type];

      return {
        ...agent,
        template,
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Failed to fetch agent");
    }
  }

  // Create agent from template
  async createAgent(input: CreateAgentInput) {
    const { userId, type, name } = input;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Verify agent type exists
    const template = AGENT_TEMPLATES[type];
    if (!template) {
      throw new ApiError(400, "Invalid agent type");
    }

    try {
      const agent = await prisma.agent.create({
        data: {
          userId,
          type,
          name: name || template.name,
          description: template.description,
          systemPrompt: template.systemPrompt,
          tools: template.tools,
          enabled: true,
        },
      });

      return {
        ...agent,
        template,
      };
    } catch (error) {
      throw new ApiError(500, "Failed to create agent");
    }
  }

  // Update agent
  async updateAgent(input: UpdateAgentInput) {
    const { agentId, userId, name, systemPrompt, enabled } = input;

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      throw new ApiError(404, "Agent not found");
    }

    if (agent.userId !== userId) {
      throw new ApiError(403, "Unauthorized to update agent");
    }

    try {
      const updated = await prisma.agent.update({
        where: { id: agentId },
        data: {
          ...(name && { name }),
          ...(systemPrompt && { systemPrompt }),
          ...(enabled !== undefined && { enabled }),
        },
      });

      const template = AGENT_TEMPLATES[updated.type];

      return {
        ...updated,
        template,
      };
    } catch (error) {
      throw new ApiError(500, "Failed to update agent");
    }
  }

  // Delete agent
  async deleteAgent(agentId: string, userId: string) {
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      throw new ApiError(404, "Agent not found");
    }

    if (agent.userId !== userId) {
      throw new ApiError(403, "Unauthorized to delete agent");
    }

    try {
      await prisma.agent.delete({
        where: { id: agentId },
      });

      return { success: true };
    } catch (error) {
      throw new ApiError(500, "Failed to delete agent");
    }
  }

  // Enable/disable agent
  async toggleAgent(agentId: string, userId: string, enabled: boolean) {
    return this.updateAgent({ agentId, userId, enabled });
  }

  // Get agent system prompt (for use in chat)
  getSystemPrompt(agentType: string): string {
    const template = AGENT_TEMPLATES[agentType];
    return template?.systemPrompt || "You are a helpful AI assistant.";
  }
}

export const agentService = new AgentService();
