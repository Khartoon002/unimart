import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { markConversationRead } from "@/server/actions/message.actions";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify participant
  const participant = await prisma.conversationParticipant.findFirst({
    where: { conversationId: id, userId: session.user.id },
  });
  if (!participant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  // Mark as read in background
  markConversationRead(id).catch(() => {});

  return NextResponse.json(messages);
}
