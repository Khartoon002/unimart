"use client";

// NO top-level import of pusher-js — it accesses the `location` global at module
// load time, which crashes during Next.js SSG. We lazy-require it inside the
// function, which only runs inside useEffect (client-side).

type PusherClientType = import("pusher-js").default;

let _pusherClient: PusherClientType | null = null;

export function getPusherClient(): PusherClientType {
  if (typeof window === "undefined")
    throw new Error("getPusherClient must be called client-side");

  if (!_pusherClient) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
    const mod = require("pusher-js") as any;
    const PusherClass: new (key: string, opts: object) => PusherClientType =
      mod.default ?? mod;

    _pusherClient = new PusherClass(
      process.env.NEXT_PUBLIC_PUSHER_KEY ?? "",
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "mt1",
        authEndpoint: "/api/pusher/auth",
      }
    );
  }

  return _pusherClient;
}
