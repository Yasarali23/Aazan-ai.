// services/voice-service.ts - Voice I/O Processing
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api-response";
import * as fs from "fs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface TranscribeAudioInput {
  userId: string;
  filePath: string;
  fileName: string;
}

interface TextToSpeechInput {
  userId: string;
  text: string;
  voice?: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
}

interface ProcessVoiceInput {
  userId: string;
  audioPath: string;
}

export class VoiceService {
  // Transcribe audio to text
  async transcribeAudio(input: TranscribeAudioInput) {
    const { userId, filePath, fileName } = input;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    try {
      // Read audio file
      const audioBuffer = fs.readFileSync(filePath);

      // Use OpenAI Whisper API
      const transcript = await openai.audio.transcriptions.create({
        file: new File([audioBuffer], fileName, { type: "audio/mpeg" }),
        model: "whisper-1",
      });

      // Save transcript
      const saved = await prisma.document.create({
        data: {
          userId,
          name: `Transcript: ${fileName}`,
          type: "transcript",
          content: transcript.text,
          url: filePath,
          s3Key: `transcripts/${userId}/${Date.now()}`,
          size: audioBuffer.length,
          processed: true,
        },
      });

      return {
        transcript: transcript.text,
        language: "en",
        duration: 0,
        documentId: saved.id,
      };
    } catch (error) {
      throw new ApiError(500, "Failed to transcribe audio");
    }
  }

  // Convert text to speech
  async textToSpeech(input: TextToSpeechInput) {
    const { userId, text, voice = "nova" } = input;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    try {
      const audioResponse = await openai.audio.speech.create({
        model: "tts-1",
        voice,
        input: text,
        response_format: "mp3",
      });

      // Save audio file
      const fileName = `tts-${Date.now()}.mp3`;
      const audioPath = `/tmp/${fileName}`;
      const buffer = Buffer.from(await audioResponse.arrayBuffer());
      fs.writeFileSync(audioPath, buffer);

      // Save record
      const saved = await prisma.document.create({
        data: {
          userId,
          name: `Audio: ${text.substring(0, 50)}`,
          type: "audio",
          content: text,
          url: audioPath,
          s3Key: `audio/${userId}/${fileName}`,
          size: buffer.length,
          processed: true,
        },
      });

      return {
        audioPath,
        fileName,
        voice,
        textLength: text.length,
        documentId: saved.id,
      };
    } catch (error) {
      throw new ApiError(500, "Failed to convert text to speech");
    }
  }

  // Process voice command
  async processVoiceCommand(input: ProcessVoiceInput) {
    const { userId, audioPath } = input;

    try {
      // Step 1: Transcribe audio
      const transcript = await this.transcribeAudio({
        userId,
        filePath: audioPath,
        fileName: "command.mp3",
      });

      // Step 2: Parse command from transcript
      const command = this.parseVoiceCommand(transcript.transcript);

      return {
        transcript: transcript.transcript,
        command,
        status: "processed",
      };
    } catch (error) {
      throw new ApiError(500, "Failed to process voice command");
    }
  }

  // Parse voice commands
  private parseVoiceCommand(text: string) {
    const lowerText = text.toLowerCase();

    // Simple command parsing
    if (
      lowerText.includes("generate") ||
      lowerText.includes("create") ||
      lowerText.includes("image")
    ) {
      return {
        type: "generate_image",
        prompt: text,
      };
    }

    if (
      lowerText.includes("summarize") ||
      lowerText.includes("summary") ||
      lowerText.includes("analyze")
    ) {
      return {
        type: "analyze_document",
        action: "summarize",
      };
    }

    if (lowerText.includes("chat") || lowerText.includes("message")) {
      return {
        type: "send_message",
        content: text,
      };
    }

    return {
      type: "unknown",
      text,
    };
  }

  // Get user's voice files
  async getUserVoiceFiles(userId: string) {
    try {
      const files = await prisma.document.findMany({
        where: {
          userId,
          type: { in: ["audio", "transcript"] },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      return files;
    } catch (error) {
      throw new ApiError(500, "Failed to fetch voice files");
    }
  }

  // Delete voice file
  async deleteVoiceFile(fileId: string, userId: string) {
    const file = await prisma.document.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new ApiError(404, "File not found");
    }

    if (file.userId !== userId) {
      throw new ApiError(403, "Unauthorized");
    }

    try {
      await prisma.document.delete({
        where: { id: fileId },
      });

      return { success: true };
    } catch (error) {
      throw new ApiError(500, "Failed to delete file");
    }
  }

  // Get available voices
  getAvailableVoices() {
    return [
      { id: "alloy", name: "Alloy", description: "Neutral voice" },
      { id: "echo", name: "Echo", description: "Professional voice" },
      { id: "fable", name: "Fable", description: "Warm voice" },
      { id: "onyx", name: "Onyx", description: "Deep voice" },
      { id: "nova", name: "Nova", description: "Bright voice" },
      { id: "shimmer", name: "Shimmer", description: "Clear voice" },
    ];
  }
}

export const voiceService = new VoiceService();
