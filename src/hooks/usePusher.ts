"use client";

import { useEffect, useRef } from "react";
import { getPusherClient } from "@/lib/pusher-client";
import type { Channel } from "pusher-js";

export function usePusherChannel(
  channelName: string | null,
  events: Record<string, (data: unknown) => void>
) {
  const channelRef = useRef<Channel | null>(null);

  useEffect(() => {
    if (!channelName) return;

    const pusher = getPusherClient();
    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    Object.entries(events).forEach(([event, handler]) => {
      channel.bind(event, handler);
    });

    return () => {
      Object.keys(events).forEach((event) => {
        channel.unbind(event);
      });
      pusher.unsubscribe(channelName);
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName]);
}
