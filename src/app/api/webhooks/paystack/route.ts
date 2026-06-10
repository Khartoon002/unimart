import { NextResponse } from "next/server";

// Paystack integration is disabled — payment confirmation is handled
// directly via confirmPayment() server action.
export async function POST() {
  return NextResponse.json({ received: true });
}
