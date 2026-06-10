import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!session.user.roles.includes("MERCHANT")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;

  const merchant = await prisma.merchantProfile.findUnique({ where: { userId: session.user.id } });
  if (!merchant) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const orders = await prisma.order.findMany({
    where: {
      merchantId: merchant.id,
      ...(status ? { status: status as never } : {}),
    },
    include: {
      buyer: { select: { id: true, name: true, avatar: true, email: true } },
      items: { include: { product: { select: { id: true, title: true, images: true } } } },
      timeline: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}