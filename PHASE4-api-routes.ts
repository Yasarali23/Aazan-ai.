// API ROUTES FOR PHASE 4

// 1. app/api/images/route.ts - Image Generation API
export async function POST(req: Request) {
  const { prompt, size = "1024x1024", quantity = 1 } = await req.json();
  const session = await getServerSession();

  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  try {
    const result = await imageService.generateImage({
      userId: session.user.id,
      prompt,
      size,
      quantity,
    });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: "Failed to generate image" }, { status: 500 });
  }
}

// 2. app/api/images/analyze/route.ts - Image Analysis API
export async function POST(req: Request) {
  const { imageUrl, question } = await req.json();
  const session = await getServerSession();

  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  try {
    const result = await imageService.analyzeImage({
      userId: session.user.id,
      imageUrl,
      question,
    });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: "Failed to analyze image" }, { status: 500 });
  }
}

// 3. app/api/documents/pdf/route.ts - PDF Upload API
export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const session = await getServerSession();

  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  if (!file) return new Response("No file provided", { status: 400 });

  try {
    const buffer = await file.arrayBuffer();
    const filePath = `/tmp/${file.name}`;
    fs.writeFileSync(filePath, Buffer.from(buffer));

    const result = await pdfService.uploadPDF({
      userId: session.user.id,
      fileName: file.name,
      filePath,
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: "Failed to upload PDF" }, { status: 500 });
  }
}

// 4. app/api/documents/pdf/[id]/chat/route.ts - PDF Chat API
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { question } = await req.json();
  const session = await getServerSession();

  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  try {
    const result = await pdfService.chatWithPDF({
      userId: session.user.id,
      documentId: params.id,
      question,
    });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: "Failed to chat with PDF" }, { status: 500 });
  }
}

// 5. app/api/documents/pdf/[id]/summarize/route.ts - PDF Summarize API
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession();

  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  try {
    const result = await pdfService.summarizeDocument(params.id, session.user.id);
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: "Failed to summarize" }, { status: 500 });
  }
}

// 6. app/api/voice/transcribe/route.ts - Transcribe Audio API
export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const session = await getServerSession();

  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  if (!file) return new Response("No file provided", { status: 400 });

  try {
    const buffer = await file.arrayBuffer();
    const filePath = `/tmp/${file.name}`;
    fs.writeFileSync(filePath, Buffer.from(buffer));

    const result = await voiceService.transcribeAudio({
      userId: session.user.id,
      filePath,
      fileName: file.name,
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: "Failed to transcribe" }, { status: 500 });
  }
}

// 7. app/api/voice/synthesize/route.ts - Text to Speech API
export async function POST(req: Request) {
  const { text, voice = "nova" } = await req.json();
  const session = await getServerSession();

  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  try {
    const result = await voiceService.textToSpeech({
      userId: session.user.id,
      text,
      voice,
    });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: "Failed to synthesize speech" }, { status: 500 });
  }
}

// 8. app/api/voice/command/route.ts - Voice Command API
export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const session = await getServerSession();

  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  try {
    const buffer = await file.arrayBuffer();
    const filePath = `/tmp/${file.name}`;
    fs.writeFileSync(filePath, Buffer.from(buffer));

    const result = await voiceService.processVoiceCommand({
      userId: session.user.id,
      audioPath: filePath,
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: "Failed to process command" }, { status: 500 });
  }
}

// 9. app/api/ocr/extract/route.ts - OCR Text Extraction API
export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const session = await getServerSession();

  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  try {
    const buffer = await file.arrayBuffer();
    const filePath = `/tmp/${file.name}`;
    fs.writeFileSync(filePath, Buffer.from(buffer));

    const result = await ocrService.extractTextFromImage({
      userId: session.user.id,
      imagePath: filePath,
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: "Failed to extract text" }, { status: 500 });
  }
}

// 10. app/api/ocr/digitize/route.ts - Document Digitization API
export async function POST(req: Request) {
  const { imagePaths, documentName } = await req.json();
  const session = await getServerSession();

  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  try {
    const result = await ocrService.digitizeDocument({
      userId: session.user.id,
      imagePaths,
      documentName,
    });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: "Failed to digitize" }, { status: 500 });
  }
}

// 11. app/api/documents/list/route.ts - List All Documents
export async function GET(req: Request) {
  const session = await getServerSession();

  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  try {
    const documents = await prisma.document.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return Response.json(documents);
  } catch (error) {
    return Response.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

// 12. app/api/documents/[id]/delete/route.ts - Delete Document
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession();

  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  try {
    const document = await prisma.document.findUnique({
      where: { id: params.id },
    });

    if (!document || document.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 403 });
    }

    await prisma.document.delete({
      where: { id: params.id },
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
