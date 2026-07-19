// app/api/chats/[id]/messages/agent/route.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { streamingService } from "@/services/streaming-service";
import { agentService } from "@/services/agent-service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const schema = z.object({
      content: z.string().min(1),
      agentId: z.string().optional(),
      model: z.string().optional(),
    });

    const { content, agentId, model = "claude-sonnet" } = schema.parse(body);

    // Get chat
    const chat = await prisma.chat.findUnique({
      where: { id: params.id },
      include: { messages: true },
    });

    if (!chat) {
      return NextResponse.json(
        { error: "Chat not found" },
        { status: 404 }
      );
    }

    if (chat.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get agent if provided
    let systemPrompt = chat.systemPrompt;
    if (agentId) {
      try {
        const agent = await agentService.getAgent(agentId, session.user.id);
        systemPrompt = agent.systemPrompt;
      } catch (error) {
        console.log("Agent not found, using default prompt");
      }
    }

    // Save user message
    await prisma.message.create({
      data: {
        chatId: params.id,
        role: "user",
        content,
        metadata: { agent: agentId },
      } as any,
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

    // Get streaming response
    const stream = await streamingService.streamResponse({
      model,
      messages,
      temperature: chat.temperature,
      maxTokens: chat.maxTokens,
      systemPrompt: systemPrompt || undefined,
    });

    // Collect full response for saving
    let fullResponse = "";

    const reader = stream.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fullResponse += decoder.decode(value);
    }

    // Save assistant message
    await prisma.message.create({
      data: {
        chatId: params.id,
        role: "assistant",
        content: fullResponse,
        metadata: { agent: agentId },
      } as any,
    });

    // Update chat
    await prisma.chat.update({
      where: { id: params.id },
      data: { updatedAt: new Date() },
    });

    // Return collected response
    return new Response(fullResponse, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Length": Buffer.byteLength(fullResponse).toString(),
      },
    });
  } catch (error) {
    console.error("Agent message error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
