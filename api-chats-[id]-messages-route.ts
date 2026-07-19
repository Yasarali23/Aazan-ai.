// app/api/chats/[id]/messages/route.ts
import { auth } from "@/auth";
import { chatService } from "@/services/chat-service";
import { successResponse, handleApiError } from "@/lib/api-response";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// GET /api/chats/[id]/messages - Get chat messages
export async function GET(
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

    const chat = await chatService.getChat(params.id, session.user.id);

    return NextResponse.json(
      successResponse(chat.messages),
      { status: 200 }
    );
  } catch (error) {
    const { statusCode, body } = handleApiError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}

// POST /api/chats/[id]/messages - Send message
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
    });

    const { content } = schema.parse(body);

    const result = await chatService.sendMessage({
      chatId: params.id,
      userId: session.user.id,
      content,
    });

    return NextResponse.json(
      successResponse(result, "Message sent successfully"),
      { status: 200 }
    );
  } catch (error) {
    const { statusCode, body } = handleApiError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
