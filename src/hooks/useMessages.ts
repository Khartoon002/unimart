"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { getPusherClient } from "@/lib/pusher-client";
import type { Message } from "@prisma/client";

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await fetch("/api/messages");
      if (!res.ok) throw new Error("Failed to fetch conversations");
      return res.json();
    },
    staleTime: 10_000,
  });
}

export function useMessages(conversationId: string) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      const res = await fetch(`/api/messages/${conversationId}`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    enabled: !!conversationId,
    staleTime: 5_000,
  });

  useEffect(() => {
    if (!conversationId) return;
    const pusher = getPusherClient();
    const channel = pusher.subscribe(`private-conversation-${conversationId}`);
    channel.bind("new-message", (msg: Message) => {
      qc.setQueryData(
        ["messages", conversationId],
        (old: Message[] | undefined) => [...(old ?? []), msg]
      );
    });
    return () => {
      pusher.unsubscribe(`private-conversation-${conversationId}`);
    };
  }, [conversationId, qc]);

  return query;
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      conversationId?: string;
      recipientId?: string;
      content: string;
      productRefId?: string;
    }) => {
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: (_, vars) => {
      if (vars.conversationId) {
        qc.invalidateQueries({ queryKey: ["messages", vars.conversationId] });
      }
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
