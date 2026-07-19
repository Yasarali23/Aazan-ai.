// services/ocr-service.ts - Optical Character Recognition
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api-response";
import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ExtractTextFromImageInput {
  userId: string;
  imagePath: string;
  language?: string;
}

interface DigitizeDocumentInput {
  userId: string;
  imagePaths: string[];
  documentName: string;
}

interface RecognizeTextInput {
  userId: string;
  imageUrl: string;
}

export class OCRService {
  // Extract text from image
  async extractTextFromImage(input: ExtractTextFromImageInput) {
    const { userId, imagePath, language = "en" } = input;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    try {
      // Read image file
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString("base64");
      const mimeType = this.getMimeType(imagePath);

      // Use Claude Vision for OCR
      const response = await anthropic.messages.create({
        model: "claude-opus-4-6",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mimeType as
                    | "image/jpeg"
                    | "image/png"
                    | "image/gif"
                    | "image/webp",
                  data: base64Image,
                },
              },
              {
                type: "text",
                text: `Extract all text from this image. Return the text exactly as it appears, preserving formatting where possible. Language: ${language}`,
              },
            ],
          },
        ],
      });

      const extractedText =
        response.content[0].type === "text" ? response.content[0].text : "";

      // Save extracted text
      const document = await prisma.document.create({
        data: {
          userId,
          name: `OCR: ${imagePath.split("/").pop()}`,
          type: "ocr",
          content: extractedText,
          url: imagePath,
          s3Key: `ocr/${userId}/${Date.now()}`,
          size: imageBuffer.length,
          processed: true,
          metadata: { language },
        },
      });

      return {
        extractedText,
        confidence: 0.95,
        language,
        documentId: document.id,
        characterCount: extractedText.length,
      };
    } catch (error) {
      throw new ApiError(500, "Failed to extract text from image");
    }
  }

  // Digitize document (multiple pages)
  async digitizeDocument(input: DigitizeDocumentInput) {
    const { userId, imagePaths, documentName } = input;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    try {
      const allText: string[] = [];

      // Process each page
      for (const imagePath of imagePaths) {
        const result = await this.extractTextFromImage({
          userId,
          imagePath,
        });
        allText.push(`--- Page ${allText.length + 1} ---\n${result.extractedText}`);
      }

      const fullText = allText.join("\n\n");

      // Save complete document
      const document = await prisma.document.create({
        data: {
          userId,
          name: documentName,
          type: "digitized",
          content: fullText,
          url: imagePaths[0],
          s3Key: `digitized/${userId}/${Date.now()}`,
          size: fullText.length,
          pages: imagePaths.length,
          processed: true,
        },
      });

      return {
        documentId: document.id,
        documentName,
        pageCount: imagePaths.length,
        totalCharacters: fullText.length,
        text: fullText,
      };
    } catch (error) {
      throw new ApiError(500, "Failed to digitize document");
    }
  }

  // Recognize text with detailed analysis
  async recognizeText(input: RecognizeTextInput) {
    const { userId, imageUrl } = input;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    try {
      // Analyze image with Claude
      const response = await anthropic.messages.create({
        model: "claude-opus-4-6",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "url",
                  url: imageUrl,
                },
              },
              {
                type: "text",
                text: `Analyze this image and extract:
1. All visible text
2. Text layout/structure
3. Text orientation (horizontal/vertical)
4. Confidence level for each text section
5. Any special characters or formatting

Return as JSON with fields: text, layout, orientation, confidence, special_chars`,
              },
            ],
          },
        ],
      });

      const analysisText =
        response.content[0].type === "text" ? response.content[0].text : "";

      // Try to parse as JSON
      let analysis;
      try {
        analysis = JSON.parse(analysisText);
      } catch {
        analysis = {
          text: analysisText,
          layout: "unknown",
          orientation: "horizontal",
          confidence: 0.85,
        };
      }

      return {
        analysis,
        success: true,
      };
    } catch (error) {
      throw new ApiError(500, "Failed to recognize text");
    }
  }

  // Get user's OCR documents
  async getUserOCRDocuments(userId: string) {
    try {
      const documents = await prisma.document.findMany({
        where: {
          userId,
          type: { in: ["ocr", "digitized"] },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      return documents;
    } catch (error) {
      throw new ApiError(500, "Failed to fetch OCR documents");
    }
  }

  // Extract data from structured documents
  async extractStructuredData(documentId: string, userId: string) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new ApiError(404, "Document not found");
    }

    if (document.userId !== userId) {
      throw new ApiError(403, "Unauthorized");
    }

    if (!document.content) {
      throw new ApiError(400, "Document not processed");
    }

    try {
      const response = await anthropic.messages.create({
        model: "claude-opus-4-6",
        max_tokens: 2048,
        system:
          "You are a data extraction specialist. Extract structured data from documents and return as JSON.",
        messages: [
          {
            role: "user",
            content: `Extract structured data from this document:\n\n${document.content}\n\nReturn as JSON with identified fields and values.`,
          },
        ],
      });

      const extractedData =
        response.content[0].type === "text" ? response.content[0].text : "";

      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(extractedData);
      } catch {
        data = { raw: extractedData };
      }

      return {
        documentName: document.name,
        extractedData: data,
        format: typeof data === "object" ? "json" : "text",
      };
    } catch (error) {
      throw new ApiError(500, "Failed to extract structured data");
    }
  }

  // Delete OCR document
  async deleteOCRDocument(documentId: string, userId: string) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new ApiError(404, "Document not found");
    }

    if (document.userId !== userId) {
      throw new ApiError(403, "Unauthorized");
    }

    try {
      await prisma.document.delete({
        where: { id: documentId },
      });

      return { success: true };
    } catch (error) {
      throw new ApiError(500, "Failed to delete document");
    }
  }

  // Helper: Get MIME type from file path
  private getMimeType(filePath: string): string {
    const ext = filePath.split(".").pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
    };
    return mimeTypes[ext || ""] || "image/jpeg";
  }
}

export const ocrService = new OCRService();
