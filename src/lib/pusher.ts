import Pusher from "pusher";
import PusherClient from "pusher-js";

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID ?? "",
  key: process.env.NEXT_PUBLIC_PUSHER_KEY ?? "",
  secret: process.env.PUSHER_SECRET ?? "",
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "mt1",
  useTLS: true,
});

export async function triggerEvent(channel: string, event: string, data: unknown) {
  try {
    await pusherServer.trigger(channel, event, data);
  } catch (e) {
    console.error("Pusher trigger error:", e);
  }
}

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
