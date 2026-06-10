import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;

  const orders = await prisma.order.findMany({
    where: {
      buyerId: session.user.id,
      ...(status ? { status: status as never } : {}),
    },
    include: {
      merchant: { include: { user: { select: { name: true, avatar: true } } } },
      items: { include: { product: { select: { id: true, title: true, images: true } } } },
      timeline: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}