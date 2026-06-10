import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.text();
  const params = new URLSearchParams(body);
  const socketId = params.get("socket_id");
  const channel = params.get("channel_name");

  if (!socketId || !channel) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const userId = session.user.id;

  // Authorize private-user-{userId} channels
  if (channel === `private-user-${userId}`) {
    const authResponse = pusherServer.authorizeChannel(socketId, channel);
    return NextResponse.json(authResponse);
  }

  // Authorize private-conversation-{id} channels — verify participant
  if (channel.startsWith("private-conversation-")) {
    const conversationId = channel.replace("private-conversation-", "");
    const participant = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId },
    });
    if (!participant) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const authResponse = pusherServer.authorizeChannel(socketId, channel);
    return NextResponse.json(authResponse);
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}