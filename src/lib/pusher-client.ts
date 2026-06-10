"use client";

import type PusherType from "pusher-js";

let pusherClient: PusherType | null = null;

export function getPusherClient(): PusherType | null {
  if (typeof window === "undefined") return null;

  if (!pusherClient) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
    const mod = require("pusher-js") as any;
    // CJS export shape: { Pusher: fn } — fallback to default/module for safety
    const PusherClass: typeof PusherType = mod.Pusher ?? mod.default ?? mod;
    pusherClient = new PusherClass(process.env.NEXT_PUBLIC_PUSHER_KEY ?? "", {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "mt1",
      authEndpoint: "/api/pusher/auth",
    });
  }

  return pusherClient;
}
