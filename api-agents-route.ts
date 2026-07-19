// app/api/agents/route.ts
import { auth } from "@/auth";
import { agentService } from "@/services/agent-service";
import { successResponse, handleApiError } from "@/lib/api-response";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// GET /api/agents - List user agents
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const agents = await agentService.getUserAgents(session.user.id);

    return NextResponse.json(
      successResponse(agents),
      { status: 200 }
    );
  } catch (error) {
    const { statusCode, body } = handleApiError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}

// POST /api/agents - Create agent
export async function POST(request: NextRequest) {
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
      type: z.string().min(1),
      name: z.string().optional(),
      systemPrompt: z.string().optional(),
    });

    const data = schema.parse(body);

    const agent = await agentService.createAgent({
      userId: session.user.id,
      ...data,
    });

    return NextResponse.json(
      successResponse(agent, "Agent created successfully"),
      { status: 201 }
    );
  } catch (error) {
    const { statusCode, body } = handleApiError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
