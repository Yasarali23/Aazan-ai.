// app/chat/[id]/page.tsx
import { notFound } from "next/navigation";
import { ChatInterface } from "@/components/chat-interface";
import { auth } from "@/auth";

interface ChatPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: ChatPageProps) {
  return {
    title: "Chat - AAZAN AI",
    description: "Continue your conversation with AAZAN AI",
  };
}

export default async function ChatPage({ params }: ChatPageProps) {
  const session = await auth();

  if (!session?.user) {
    notFound();
  }

  return (
    <main className="flex-1 overflow-hidden">
      <ChatInterface chatId={params.id} />
    </main>
  );
}
