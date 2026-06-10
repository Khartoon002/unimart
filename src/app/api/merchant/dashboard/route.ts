import { NextResponse } from "next/server";
import { getMerchantDashboard } from "@/server/actions/merchant.actions";

export async function GET() {
  const result = await getMerchantDashboard();
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result.data);
}