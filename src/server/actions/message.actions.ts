"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendMessageSchema, type SendMessageInput } from "@/lib/validations";
import { triggerEvent } from "@/lib/pusher-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionResult, ConversationWithDetails } from "@/types";
import type { Message } from "@prisma/client";

export async function sendMessage(input: SendMessageInput): Promise<ActionResult<Message>> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  try {
    const parsed = sendMessageSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.errors[0].message };

    const { conversationId, recipientId, content, productRefId } = parsed.data;

    let convoId = conversationId;

    if (!convoId) {
      const existing = await prisma.conversation.findFirst({
        where: {
          AND: [
            { participants: { some: { userId: session.user.id } } },
            { participants: { some: { userId: recipientId } } },
            ...(productRefId ? [{ productId: productRefId }] : []),
          ],
        },
      });

      if (existing) {
        convoId = existing.id;
      } else {
        const convo = await prisma.conversation.create({
          data: {
            productId: productRefId ?? null,
            participants: {
              create: [
                { userId: session.user.id! },
                { userId: recipientId! },
              ],
            },
          },
        });
        convoId = convo.id;
      }
    } else {
      const participant = await prisma.conversationParticipant.findFirst({
        where: { conversationId: convoId, userId: session.user.id },
      });
      if (!participant) return { error: "Unauthorized" };
    }

    const message = await prisma.message.create({
      data: {
        conversationId: convoId,
        senderId: session.user.id,
        content,
        productRefId: productRefId ?? null,
      },
    });

    await prisma.$transaction([
      prisma.conversation.update({
        where: { id: convoId },
        data: { lastMessageAt: new Date() },
      }),
      prisma.conversationParticipant.updateMany({
        where: {
          conversationId: convoId,
          userId: { not: session.user.id },
        },
        data: { unreadCount: { increment: 1 } },
      }),
    ]);

    await triggerEvent(
      `private-conversation-${convoId}`,
      "new-message",
      message
    );

    revalidatePath("/messages");

    return { data: message };
  } catch (e) {
    console.error("sendMessage error:", e);
    return { error: "Failed to send message" };
  }
}

export async function markConversationRead(conversationId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  try {
    await prisma.$transaction([
      prisma.conversationParticipant.updateMany({
        where: { conversationId, userId: session.user.id },
        data: { unreadCount: 0 },
      }),
      prisma.message.updateMany({
        where: { conversationId, senderId: { not: session.user.id } },
        data: { isRead: true },
      }),
    ]);

    revalidatePath("/messages");

    return { data: null };
  } catch (e) {
    console.error("markConversationRead error:", e);
    return { error: "Failed to mark as read" };
  }
}

export async function getConversations(): Promise<ActionResult<ConversationWithDetails[]>> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: { some: { userId: session.user.id } },
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    return { data: conversations as ConversationWithDetails[] };
  } catch (e) {
    console.error("getConversations error:", e);
    return { error: "Failed to fetch conversations" };
  }
}
