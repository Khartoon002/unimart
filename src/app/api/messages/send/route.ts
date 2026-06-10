import { NextRequest, NextResponse } from "next/server";
import { sendMessage } from "@/server/actions/message.actions";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await sendMessage(body);
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result.data);
}