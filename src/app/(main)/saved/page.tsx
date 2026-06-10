import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Heart } from "lucide-react";
import { EmptyState } from "@/components/unimart/EmptyState";
import { ProductGrid } from "@/components/unimart/ProductGrid";
import type { MeilisearchProduct } from "@/types";

export default async function SavedPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const saved = await prisma.savedProduct.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          merchant: { include: { user: { select: { id: true, name: true, avatar: true } } } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const products: MeilisearchProduct[] = saved
    .filter((s) => s.product.status === "ACTIVE")
    .map((s) => ({
      id: s.product.id,
      title: s.product.title,
      description: s.product.description ?? "",
      price: Number(s.product.price),
      compareAtPrice: s.product.compareAtPrice != null ? Number(s.product.compareAtPrice) : undefined,
      images: s.product.images,
      category: s.product.category,
      stock: s.product.stock,
      isPerishable: s.product.isPerishable,
      expiresAt: s.product.expiresAt?.toISOString(),
      merchantId: s.product.merchantId,
      merchantStoreName: s.product.merchant.storeName,
      merchantAvatar: s.product.merchant.user.avatar ?? undefined,
      merchantVerified: s.product.merchant.isVerified,
      rating: s.product.rating,
      reviewCount: s.product.reviewCount,
      tags: s.product.tags,
      status: s.product.status,
      createdAt: s.product.createdAt.toISOString(),
      viewCount: s.product.viewCount,
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Saved items</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-text-2)" }}>{products.length} saved product{products.length !== 1 ? "s" : ""}</p>
      </div>

      {products.length === 0 ? (
        <EmptyState icon={Heart} title="Nothing saved yet"
          description="Tap the heart icon on any product to save it for later."
          action={{ label: "Browse marketplace", href: "/marketplace" }} />
      ) : (
        <ProductGrid products={products} savedIds={products.map((p) => p.id)} />
      )}
    </div>
  );
}
