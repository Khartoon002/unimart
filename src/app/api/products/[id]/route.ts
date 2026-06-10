import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.merchantProfileId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const product = await prisma.product.findFirst({
    where: { id, merchantId: session.user.merchantProfileId },
    include: { variants: { include: { options: true } } },
  });

  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}
