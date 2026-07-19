// services/pdf-service.ts - PDF Processing & Analysis
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api-response";
import { Anthropic } from "@anthropic-ai/sdk";
import * as fs from "fs";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface UploadPDFInput {
  userId: string;
  fileName: string;
  filePath: string;
}

interface ChatWithPDFInput {
  userId: string;
  documentId: string;
  question: string;
}

interface ExtractTextInput {
  documentId: string;
  userId: string;
}

export class PDFService {
  // Upload and process PDF
  async uploadPDF(input: UploadPDFInput) {
    const { userId, fileName, filePath } = input;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    try {
      // Read file
      const fileBuffer = fs.readFileSync(filePath);
      const fileSize = fileBuffer.length;

      // In production, upload to S3
      const s3Key = `pdfs/${userId}/${Date.now()}-${fileName}`;

      // Create document record
      const document = await prisma.document.create({
        data: {
          userId,
          name: fileName,
          type: "pdf",
          url: filePath, // Would be S3 URL in production
          s3Key,
          size: fileSize,
          processed: false,
        },
      });

      // Process PDF (extract text)
      // In production, use PDF parsing library
      const text = await this.extractTextFromPDF(filePath);

      // Update document with extracted content
      await prisma.document.update({
        where: { id: document.id },
        data: {
          content: text,
          processed: true,
          pages: Math.ceil(text.length / 1000), // Rough estimate
        },
      });

      return document;
    } catch (error) {
      throw new ApiError(500, "Failed to upload PDF");
    }
  }

  // Extract text from PDF (simplified)
  private async extractTextFromPDF(filePath: string): Promise<string> {
    try {
      // In production, use pdf-parse or similar library
      // For now, return placeholder
      const fileContent = fs.readFileSync(filePath, "utf8");
      return fileContent || "PDF content extracted";
    } catch (error) {
      throw new ApiError(500, "Failed to extract PDF text");
    }
  }

  // Chat with PDF document
  async chatWithPDF(input: ChatWithPDFInput) {
    const { userId, documentId, question } = input;

    // Get document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new ApiError(404, "Document not found");
    }

    if (document.userId !== userId) {
      throw new ApiError(403, "Unauthorized access to document");
    }

    if (!document.processed || !document.content) {
      throw new ApiError(400, "Document not processed yet");
    }

    try {
      // Create message with document context
      const response = await anthropic.messages.create({
        model: "claude-opus-4-6",
        max_tokens: 1024,
        system: `You are a document analysis assistant. You have access to the following document content:

${document.content}

Answer questions about this document based on its content. If the answer is not in the document, say so.`,
        messages: [
          {
            role: "user",
            content: question,
          },
        ],
      });

      const responseText =
        response.content[0].type === "text" ? response.content[0].text : "";

      // Save conversation
      await prisma.message.create({
        data: {
          chatId: "", // In production, associate with a chat
          role: "user",
          content: question,
          metadata: { documentId },
        } as any,
      });

      await prisma.message.create({
        data: {
          chatId: "", // In production, associate with a chat
          role: "assistant",
          content: responseText,
          metadata: { documentId },
        } as any,
      });

      return {
        answer: responseText,
        documentName: document.name,
      };
    } catch (error) {
      throw new ApiError(500, "Failed to analyze document");
    }
  }

  // Extract specific text from PDF
  async extractText(input: ExtractTextInput) {
    const { documentId, userId } = input;

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

    return {
      documentName: document.name,
      content: document.content,
      pages: document.pages || 1,
      size: document.size,
    };
  }

  // Get user's documents
  async getUserDocuments(userId: string) {
    try {
      const documents = await prisma.document.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      return documents;
    } catch (error) {
      throw new ApiError(500, "Failed to fetch documents");
    }
  }

  // Delete document
  async deleteDocument(documentId: string, userId: string) {
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

  // Summarize document
  async summarizeDocument(documentId: string, userId: string) {
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
        max_tokens: 1024,
        system:
          "You are a document summarization assistant. Provide a concise summary of the document.",
        messages: [
          {
            role: "user",
            content: `Please summarize this document:\n\n${document.content}`,
          },
        ],
      });

      const summary =
        response.content[0].type === "text" ? response.content[0].text : "";

      return {
        documentName: document.name,
        summary,
        originalLength: document.content.length,
      };
    } catch (error) {
      throw new ApiError(500, "Failed to summarize document");
    }
  }
}

export const pdfService = new PDFService();
