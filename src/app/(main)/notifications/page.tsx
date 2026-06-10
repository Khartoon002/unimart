"use client";

import { useNotifications, useMarkNotificationsRead } from "@/hooks/useNotifications";
import { NotificationItem } from "@/components/unimart/NotificationItem";
import { EmptyState } from "@/components/unimart/EmptyState";
import { Bell } from "lucide-react";
import { useEffect } from "react";

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationsRead();

  useEffect(() => {
    // Mark all as read on mount
    markRead.mutate([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const notifications = data?.notifications ?? [];

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Notifications</h1>
        {data?.unreadCount > 0 && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: "var(--color-primary-soft)", color: "var(--color-primary)" }}>
            {data.unreadCount} unread
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: "var(--color-surface)" }} />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up! We'll notify you about orders, messages, and more." />
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          {notifications.map((n: Parameters<typeof NotificationItem>[0]["notif"], i: number) => (
            <div key={n.id} style={{ borderTop: i > 0 ? "1px solid var(--color-border)" : "none" }}>
              <NotificationItem notif={n} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
