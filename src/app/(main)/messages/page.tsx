"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useConversations } from "@/hooks/useMessages";
import { EmptyState } from "@/components/unimart/EmptyState";
import { formatRelativeTime, getInitials } from "@/lib/utils";
import { useSession } from "next-auth/react";

export default function MessagesPage() {
  const { data: session } = useSession();
  const { data, isLoading } = useConversations();
  const conversations = data?.conversations ?? [];

  if (isLoading) return (
    <div className="max-w-lg mx-auto space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "var(--color-surface)" }} />
      ))}
    </div>
  );

  if (conversations.length === 0) {
    return (
      <EmptyState icon={MessageCircle} title="No messages yet"
        description="Start a conversation with a merchant from a product page." />
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="font-display text-2xl font-bold">Messages</h1>
      <div className="space-y-2">
        {conversations.map((conv: { id: string; lastMessage?: { content: string; createdAt: string | Date } | null; participants: { user: { id: string; name: string | null; avatar: string | null } }[]; unreadCount?: number }) => {
          const other = conv.participants.find((p) => p.user.id !== session?.user?.id)?.user;
          return (
            <Link key={conv.id} href={`/messages/${conv.id}`}>
              <div className="flex items-center gap-3 p-4 rounded-2xl transition-colors"
                style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}>
                <div className="relative w-11 h-11 rounded-full overflow-hidden flex-shrink-0" style={{ background: "var(--color-surface-2)" }}>
                  {other?.avatar ? (
                    <Image src={other.avatar} alt={other?.name ?? ""} fill className="object-cover" />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center font-bold text-sm" style={{ color: "var(--color-text-2)" }}>
                      {getInitials(other?.name ?? "U")}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">{other?.name ?? "User"}</p>
                    {conv.lastMessage && (
                      <p className="text-xs" style={{ color: "var(--color-text-3)" }}>{formatRelativeTime(conv.lastMessage.createdAt)}</p>
                    )}
                  </div>
                  <p className="text-xs mt-0.5 truncate" style={{ color: "var(--color-text-2)" }}>
                    {conv.lastMessage?.content ?? "No messages yet"}
                  </p>
                </div>
                {(conv.unreadCount ?? 0) > 0 && (
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: "var(--color-primary)", color: "#fff" }}>
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
