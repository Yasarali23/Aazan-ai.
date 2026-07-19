// app/api/agents/[id]/route.ts
import { auth } from "@/auth";
import { agentService } from "@/services/agent-service";
import { successResponse, handleApiError } from "@/lib/api-response";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// GET /api/agents/[id] - Get agent
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

    const agent = await agentService.getAgent(params.id, session.user.id);

    return NextResponse.json(
      successResponse(agent),
      { status: 200 }
    );
  } catch (error) {
    const { statusCode, body } = handleApiError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}

// PATCH /api/agents/[id] - Update agent
export async function PATCH(
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
      name: z.string().optional(),
      systemPrompt: z.string().optional(),
      enabled: z.boolean().optional(),
    });

    const data = schema.parse(body);

    const agent = await agentService.updateAgent({
      agentId: params.id,
      userId: session.user.id,
      ...data,
    });

    return NextResponse.json(
      successResponse(agent, "Agent updated successfully"),
      { status: 200 }
    );
  } catch (error) {
    const { statusCode, body } = handleApiError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}

// DELETE /api/agents/[id] - Delete agent
export async function DELETE(
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

    await agentService.deleteAgent(params.id, session.user.id);

    return NextResponse.json(
      successResponse({ success: true }, "Agent deleted successfully"),
      { status: 200 }
    );
  } catch (error) {
    const { statusCode, body } = handleApiError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
