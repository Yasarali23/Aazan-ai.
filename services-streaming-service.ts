// services/streaming-service.ts
import { Anthropic } from "@anthropic-ai/sdk";
import { OpenAI } from "openai";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface StreamMessage {
  role: "user" | "assistant";
  content: string;
}

interface StreamOptions {
  model: string;
  messages: StreamMessage[];
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export class StreamingService {
  async streamClaudeResponse(options: StreamOptions): Promise<ReadableStream> {
    const {
      model,
      messages,
      temperature = 0.7,
      maxTokens = 2000,
      systemPrompt,
    } = options;

    return new ReadableStream({
      async start(controller) {
        try {
          const stream = await anthropic.messages.create({
            model,
            max_tokens: maxTokens,
            temperature,
            system: systemPrompt || "You are AAZAN AI, a helpful assistant.",
            messages: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            stream: true,
          });

          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(
                new TextEncoder().encode(event.delta.text)
              );
            }

            if (event.type === "message_stop") {
              controller.close();
            }
          }
        } catch (error) {
          controller.error(error);
        }
      },
    });
  }

  async streamOpenAIResponse(options: StreamOptions): Promise<ReadableStream> {
    const {
      model,
      messages,
      temperature = 0.7,
      maxTokens = 2000,
    } = options;

    return new ReadableStream({
      async start(controller) {
        try {
          const stream = await openai.chat.completions.create({
            model,
            messages: [
              {
                role: "system",
                content:
                  "You are AAZAN AI, a helpful assistant.",
              },
              ...messages.map((m) => ({
                role: m.role as "user" | "assistant",
                content: m.content,
              })),
            ],
            temperature,
            max_tokens: maxTokens,
            stream: true,
          });

          for await (const chunk of stream) {
            const choice = chunk.choices[0];
            if (choice.delta?.content) {
              controller.enqueue(
                new TextEncoder().encode(choice.delta.content)
              );
            }

            if (choice.finish_reason) {
              controller.close();
            }
          }
        } catch (error) {
          controller.error(error);
        }
      },
    });
  }

  async streamResponse(options: StreamOptions): Promise<ReadableStream> {
    const { model } = options;

    if (model.startsWith("claude")) {
      return this.streamClaudeResponse(options);
    } else if (model.startsWith("gpt")) {
      return this.streamOpenAIResponse(options);
    }

    throw new Error(`Unsupported model: ${model}`);
  }
}

export const streamingService = new StreamingService();
