"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { triggerEvent } from "@/lib/pusher-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionResult } from "@/types";
import type { NotifType } from "@prisma/client";

export async function createNotification(
  userId: string,
  type: NotifType,
  title: string,
  body: string,
  href?: string
): Promise<void> {
  try {
    const notification = await prisma.notification.create({
      data: { userId, type, title, body, href: href ?? null },
    });

    await triggerEvent(`private-user-${userId}`, "new-notification", notification);
  } catch (e) {
    console.error("createNotification error:", e);
  }
}

export async function markNotificationsRead(ids?: string[]): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  try {
    if (ids && ids.length > 0) {
      await prisma.notification.updateMany({
        where: { id: { in: ids }, userId: session.user.id },
        data: { isRead: true },
      });
    } else {
      await prisma.notification.updateMany({
        where: { userId: session.user.id, isRead: false },
        data: { isRead: true },
      });
    }

    revalidatePath("/notifications");
    return { data: null };
  } catch (e) {
    console.error("markNotificationsRead error:", e);
    return { error: "Failed to mark notifications as read" };
  }
}

export async function getNotifications(limit = 20) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  try {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.notification.count({
        where: { userId: session.user.id, isRead: false },
      }),
    ]);

    return { data: { notifications, unreadCount } };
  } catch (e) {
    console.error("getNotifications error:", e);
    return { error: "Failed to fetch notifications" };
  }
}