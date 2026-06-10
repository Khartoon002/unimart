"use client";

import { use, useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Send } from "lucide-react";
import { useSession } from "next-auth/react";
import { useMessages, useSendMessage } from "@/hooks/useMessages";
import { formatRelativeTime, getInitials } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const { data: msgs = [], isLoading } = useMessages(id);
  const sendMsg = useSendMessage();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    sendMsg.mutate({ conversationId: id, content: text.trim() }, {
      onError: () => toast.error("Failed to send message"),
    });
    setText("");
  }

  return (
    <div className="max-w-lg mx-auto flex flex-col h-[calc(100svh-168px)] md:h-[calc(100svh-120px)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 mb-4 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--color-border)" }}>
        <Link href="/messages" className="text-sm" style={{ color: "var(--color-text-3)" }}>←</Link>
        <h1 className="font-semibold">Conversation</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
              <div className="w-48 h-10 rounded-2xl animate-pulse" style={{ background: "var(--color-surface)" }} />
            </div>
          ))
        ) : (
          (msgs as Array<{ id: string; senderId: string; content: string; createdAt: string | Date; sender: { id: string; name: string | null; avatar: string | null } }>).map((msg) => {
            const isMine = msg.senderId === session?.user?.id;
            return (
              <div key={msg.id} className={`flex gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                {!isMine && (
                  <div className="relative w-7 h-7 rounded-full overflow-hidden flex-shrink-0 self-end"
                    style={{ background: "var(--color-surface-2)" }}>
                    {msg.sender.avatar ? (
                      <Image src={msg.sender.avatar} alt="" fill className="object-cover" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-xs font-bold" style={{ color: "var(--color-text-2)" }}>
                        {getInitials(msg.sender.name ?? "U")}
                      </span>
                    )}
                  </div>
                )}
                <div className={`max-w-xs ${isMine ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                  <div className="px-4 py-2.5 rounded-2xl text-sm"
                    style={{
                      background: isMine ? "var(--color-primary)" : "var(--color-surface)",
                      color: isMine ? "#fff" : "var(--color-text-1)",
                      border: isMine ? "none" : "1px solid var(--color-border)",
                    }}>
                    {msg.content}
                  </div>
                  <span className="text-xs px-1" style={{ color: "var(--color-text-3)" }}>
                    {formatRelativeTime(msg.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-3 pt-3 flex-shrink-0"
        style={{ borderTop: "1px solid var(--color-border)" }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 h-11 px-4 rounded-2xl text-sm outline-none"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }}
        />
        <button type="submit" disabled={!text.trim() || sendMsg.isPending}
          className="w-11 h-11 rounded-2xl flex items-center justify-center transition-opacity disabled:opacity-40"
          style={{ background: "var(--color-primary)", color: "#fff" }}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
