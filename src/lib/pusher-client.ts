import PusherClient from "pusher-js";

let _pusherClient: PusherClient | null = null;

export function getPusherClient(): PusherClient {
  if (_pusherClient) return _pusherClient;

  if (typeof window === "undefined")
    throw new Error("getPusherClient must be called client-side");

  _pusherClient = new PusherClient(
    process.env.NEXT_PUBLIC_PUSHER_KEY ?? "",
    {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "mt1",
      authEndpoint: "/api/pusher/auth",
    }
  );

  return _pusherClient;
}
