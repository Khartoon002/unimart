import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const order = await prisma.order.findFirst({
    where: {
      id,
      OR: [
        { buyerId: session.user.id },
        { merchant: { userId: session.user.id } },
      ],
    },
    include: {
      buyer: { select: { id: true, name: true, email: true, avatar: true } },
      merchant: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
      },
      items: { include: { product: { select: { id: true, title: true, images: true } } } },
      timeline: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}
