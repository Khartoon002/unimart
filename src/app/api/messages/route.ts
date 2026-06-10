import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const raw = await prisma.conversation.findMany({
    where: { participants: { some: { userId: session.user.id } } },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
      },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { lastMessageAt: "desc" },
  });

  const conversations = raw.map((c) => ({
    id: c.id,
    lastMessageAt: c.lastMessageAt,
    participants: c.participants,
    lastMessage: c.messages[0] ?? null,
    unreadCount: c.participants.find((p) => p.userId === session.user.id)?.unreadCount ?? 0,
  }));

  return NextResponse.json({ conversations });
}