// services/image-service.ts - Image Generation & Analysis
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api-response";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GenerateImageInput {
  userId: string;
  prompt: string;
  size?: "256x256" | "512x512" | "1024x1024";
  quantity?: number;
}

interface AnalyzeImageInput {
  userId: string;
  imageUrl: string;
  question?: string;
}

export class ImageService {
  // Generate image with DALL-E
  async generateImage(input: GenerateImageInput) {
    const { userId, prompt, size = "1024x1024", quantity = 1 } = input;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    try {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt,
        n: quantity,
        size,
        quality: "standard",
        style: "natural",
      });

      // Save to database
      const images = await Promise.all(
        response.data.map((img) =>
          prisma.document.create({
            data: {
              userId,
              name: `Generated: ${prompt.substring(0, 50)}`,
              type: "image",
              url: img.url || "",
              s3Key: `generated/${Date.now()}-${Math.random()}`,
              size: 0,
              processed: true,
              content: prompt,
            },
          })
        )
      );

      return {
        images: response.data.map((img) => ({
          url: img.url,
          revised_prompt: img.revised_prompt,
        })),
        saved: images.length,
      };
    } catch (error) {
      throw new ApiError(500, "Failed to generate image");
    }
  }

  // Analyze image with Claude Vision
  async analyzeImage(input: AnalyzeImageInput) {
    const { userId, imageUrl, question } = input;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    try {
      // Using Anthropic (Claude) for image analysis instead
      // This would require using @anthropic-ai/sdk with vision capabilities
      // For now, we'll structure it for future implementation

      const analysisPrompt = question || "Describe this image in detail.";

      // Mock response - in production, integrate with Claude Vision
      return {
        analysis: "Image analysis would be performed here",
        confidence: 0.95,
        details: {
          objects: [],
          text: [],
          description: analysisPrompt,
        },
      };
    } catch (error) {
      throw new ApiError(500, "Failed to analyze image");
    }
  }

  // Get user's generated images
  async getUserImages(userId: string) {
    try {
      const images = await prisma.document.findMany({
        where: {
          userId,
          type: "image",
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      return images;
    } catch (error) {
      throw new ApiError(500, "Failed to fetch images");
    }
  }

  // Delete generated image
  async deleteImage(imageId: string, userId: string) {
    const image = await prisma.document.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new ApiError(404, "Image not found");
    }

    if (image.userId !== userId) {
      throw new ApiError(403, "Unauthorized to delete image");
    }

    try {
      await prisma.document.delete({
        where: { id: imageId },
      });

      return { success: true };
    } catch (error) {
      throw new ApiError(500, "Failed to delete image");
    }
  }
}

export const imageService = new ImageService();
