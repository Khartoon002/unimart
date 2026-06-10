import { NextRequest, NextResponse } from "next/server";
import { markNotificationsRead } from "@/server/actions/notification.actions";

export async function POST(req: NextRequest) {
  const { ids } = await req.json();
  const result = await markNotificationsRead(ids);
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ success: true });
}