// services/chat-service.ts
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api-response";
import { Anthropic } from "@anthropic-ai/sdk";
import { OpenAI } from "openai";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface CreateChatInput {
  userId: string;
  title: string;
  model: string;
}

interface SendMessageInput {
  chatId: string;
  userId: string;
  content: string;
}

export class ChatService {
  // Create new chat
  async createChat(input: CreateChatInput) {
    const { userId, title, model } = input;

    // Validate user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Check credits
    if (user.credits <= 0 && user.subscriptionTier === "free") {
      throw new ApiError(402, "Insufficient credits", "INSUFFICIENT_CREDITS");
    }

    const chat = await prisma.chat.create({
      data: {
        userId,
        title,
        model,
      },
    });

    return chat;
  }

  // Get user chats
  async getUserChats(userId: string) {
    const chats = await prisma.chat.findMany({
      where: { userId, archived: false },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return chats;
  }

  // Get single chat
  async getChat(chatId: string, userId: string) {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!chat) {
      throw new ApiError(404, "Chat not found");
    }

    if (chat.userId !== userId) {
      throw new ApiError(403, "Unauthorized access to chat");
    }

    return chat;
  }

  // Send message and get response
  async sendMessage(input: SendMessageInput) {
    const { chatId, userId, content } = input;

    // Get chat
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { messages: true },
    });

    if (!chat) {
      throw new ApiError(404, "Chat not found");
    }

    if (chat.userId !== userId) {
      throw new ApiError(403, "Unauthorized access to chat");
    }

    // Save user message
    await prisma.message.create({
      data: {
        chatId,
        role: "user",
        content,
      },
    });

    // Prepare messages for API
    const messages = chat.messages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    messages.push({
      role: "user",
      content,
    });

    let response: string = "";

    try {
      // Call appropriate AI model
      if (chat.model.startsWith("claude")) {
        response = await this.callClaude(
          messages,
          chat.model,
          chat.temperature,
          chat.maxTokens
        );
      } else if (chat.model.startsWith("gpt")) {
        response = await this.callOpenAI(
          messages,
          chat.model,
          chat.temperature,
          chat.maxTokens
        );
      } else {
        throw new ApiError(400, "Unsupported model");
      }

      // Save assistant response
      const savedMessage = await prisma.message.create({
        data: {
          chatId,
          role: "assistant",
          content: response,
        },
      });

      // Update chat
      await prisma.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() },
      });

      return {
        message: savedMessage,
        content: response,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "Failed to generate response");
    }
  }

  // Call Claude API
  private async callClaude(
    messages: any[],
    model: string,
    temperature: number,
    maxTokens: number
  ): Promise<string> {
    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system: "You are AAZAN AI, a helpful and intelligent assistant.",
      messages,
    });

    const content = response.content[0];
    if (content.type === "text") {
      return content.text;
    }

    throw new ApiError(500, "Unexpected response format from Claude");
  }

  // Call OpenAI API
  private async callOpenAI(
    messages: any[],
    model: string,
    temperature: number,
    maxTokens: number
  ): Promise<string> {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You are AAZAN AI, a helpful and intelligent assistant.",
        },
        ...messages,
      ],
      temperature,
      max_tokens: maxTokens,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new ApiError(500, "No response from OpenAI");
    }

    return content;
  }

  // Delete chat
  async deleteChat(chatId: string, userId: string) {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      throw new ApiError(404, "Chat not found");
    }

    if (chat.userId !== userId) {
      throw new ApiError(403, "Unauthorized to delete chat");
    }

    await prisma.chat.delete({
      where: { id: chatId },
    });

    return { success: true };
  }

  // Archive chat
  async archiveChat(chatId: string, userId: string) {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      throw new ApiError(404, "Chat not found");
    }

    if (chat.userId !== userId) {
      throw new ApiError(403, "Unauthorized to archive chat");
    }

    const updated = await prisma.chat.update({
      where: { id: chatId },
      data: { archived: true },
    });

    return updated;
  }
}

export const chatService = new ChatService();
