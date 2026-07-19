// PHASE 4 COMPONENTS

// 1. components/image-generator.tsx - Image Generation UI
"use client";
import { useState } from "react";
import { ImagePlus, Loader } from "lucide-react";

export function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const generateImage = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/images", {
        method: "POST",
        body: JSON.stringify({
          prompt,
          size: "1024x1024",
          quantity: 1,
        }),
      });
      const data = await res.json();
      if (data.images) {
        setImages(data.images.map((img: any) => img.url));
      }
    } catch (error) {
      console.error("Failed to generate image", error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <ImagePlus className="w-6 h-6" />
        Image Generator
      </h2>

      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to generate..."
          className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
        />

        <button
          onClick={generateImage}
          disabled={loading || !prompt}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Image"
          )}
        </button>

        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mt-6">
            {images.map((img, idx) => (
              <img key={idx} src={img} alt="Generated" className="rounded-lg w-full" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// 2. components/pdf-chat.tsx - PDF Chat UI
"use client";
import { useState } from "react";
import { FileText, Send, Loader } from "lucide-react";

interface PDFChatProps {
  documentId: string;
  documentName: string;
}

export function PDFChat({ documentId, documentName }: PDFChatProps) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/documents/pdf/${documentId}/chat`, {
        method: "POST",
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setMessages([...messages, { role: "user", content: question }, { role: "assistant", content: data.answer }]);
      setQuestion("");
    } catch (error) {
      console.error("Failed to ask question", error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <FileText className="w-6 h-6" />
        Chat with {documentName}
      </h2>

      <div className="space-y-4 mb-4 h-96 overflow-y-auto bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg ${
              msg.role === "user"
                ? "bg-blue-600 text-white ml-8"
                : "bg-slate-200 dark:bg-slate-700 mr-8"
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about the document..."
          className="flex-1 p-3 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={(e) => e.key === "Enter" && askQuestion()}
        />
        <button
          onClick={askQuestion}
          disabled={loading || !question}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}

// 3. components/voice-interface.tsx - Voice I/O UI
"use client";
import { useState, useRef } from "react";
import { Mic, Volume2, Loader } from "lucide-react";

export function VoiceInterface() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    audioChunks.current = [];

    mediaRecorder.current.ondataavailable = (event) => {
      audioChunks.current.push(event.data);
    };

    mediaRecorder.current.onstop = async () => {
      const audioBlob = new Blob(audioChunks.current, { type: "audio/mp3" });
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.mp3");

      const res = await fetch("/api/voice/transcribe", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setTranscript(data.transcript);
    };

    mediaRecorder.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setRecording(false);
    }
  };

  const textToSpeech = async () => {
    if (!transcript) return;
    setSpeaking(true);

    const res = await fetch("/api/voice/synthesize", {
      method: "POST",
      body: JSON.stringify({ text: transcript, voice: "nova" }),
    });
    const data = await res.json();

    const audio = new Audio(data.audioPath);
    audio.play();

    audio.onended = () => setSpeaking(false);
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Mic className="w-6 h-6" />
        Voice Interface
      </h2>

      <div className="space-y-4">
        <button
          onClick={recording ? stopRecording : startRecording}
          className={`w-full py-3 rounded-lg text-white font-bold flex items-center justify-center gap-2 transition-colors ${
            recording ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {recording ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              Start Recording
            </>
          )}
        </button>

        {transcript && (
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Transcript:</p>
            <p className="text-base">{transcript}</p>
          </div>
        )}

        {transcript && (
          <button
            onClick={textToSpeech}
            disabled={speaking}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Volume2 className="w-5 h-5" />
            {speaking ? "Speaking..." : "Play Audio"}
          </button>
        )}
      </div>
    </div>
  );
}

// 4. components/ocr-scanner.tsx - OCR UI
"use client";
import { useState } from "react";
import { Loader, Upload, FileText } from "lucide-react";

export function OCRScanner() {
  const [extractedText, setExtractedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [documentName, setDocumentName] = useState("");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setDocumentName(file.name);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/ocr/extract", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setExtractedText(data.extractedText);
    } catch (error) {
      console.error("Failed to extract text", error);
    }

    setLoading(false);
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <FileText className="w-6 h-6" />
        OCR Scanner
      </h2>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-blue-400 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 mx-auto mb-2 text-blue-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Upload an image to extract text
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={loading}
            className="hidden"
            id="ocr-upload"
          />
          <label htmlFor="ocr-upload" className="cursor-pointer">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin inline mr-2" />
                  Processing...
                </>
              ) : (
                "Choose File"
              )}
            </button>
          </label>
        </div>

        {extractedText && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Extracted from: {documentName}
            </p>
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg max-h-96 overflow-y-auto">
              <p className="text-sm whitespace-pre-wrap">{extractedText}</p>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(extractedText)}
              className="mt-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Copy Text
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// 5. components/document-manager.tsx - Document Manager UI
"use client";
import { useEffect, useState } from "react";
import { Trash2, Download, FileText } from "lucide-react";

export function DocumentManager() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/documents/list");
      const data = await res.json();
      setDocuments(data);
    } catch (error) {
      console.error("Failed to load documents", error);
    }
    setLoading(false);
  };

  const deleteDocument = async (id: string) => {
    try {
      await fetch(`/api/documents/${id}/delete`, { method: "DELETE" });
      setDocuments(documents.filter((doc) => doc.id !== id));
    } catch (error) {
      console.error("Failed to delete document", error);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <FileText className="w-6 h-6" />
        Document Manager
      </h2>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No documents yet. Upload one to get started.
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-lg"
            >
              <div className="flex-1">
                <p className="font-medium">{doc.name}</p>
                <p className="text-xs text-gray-500">
                  {doc.type} • {new Date(doc.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="text-blue-600 hover:text-blue-700">
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => deleteDocument(doc.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
