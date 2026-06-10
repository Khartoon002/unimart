import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { BadgeCheck, Star, Package } from "lucide-react";
import { ProductGrid } from "@/components/unimart/ProductGrid";
import { RatingStars } from "@/components/unimart/RatingStars";
import { ReviewCard } from "@/components/unimart/ReviewCard";
import { getInitials, toPlainProduct } from "@/lib/utils";
import type { MeilisearchProduct, ReviewWithBuyer } from "@/types";

export default async function StorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [merchant, reviews] = await Promise.all([
    prisma.merchantProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        products: {
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
          take: 24,
        },
      },
    }),
    prisma.review.findMany({
      where: { product: { merchantId: id } },
      include: { buyer: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  if (!merchant) notFound();

  const products: MeilisearchProduct[] = merchant.products.map((p) =>
    toPlainProduct({ ...p, merchantId: merchant.id, merchant: { storeName: merchant.storeName, isVerified: merchant.isVerified, user: { avatar: merchant.user.avatar } } })
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Store banner + header */}
      <div className="relative overflow-hidden rounded-3xl"
        style={{ background: "linear-gradient(135deg, var(--color-primary-soft), var(--color-surface-2))", minHeight: 160 }}>
        {merchant.storeBanner && (
          <Image src={merchant.storeBanner} alt="" fill className="object-cover opacity-30" />
        )}
        <div className="relative flex items-end gap-4 p-6">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0"
            style={{ background: "var(--color-surface-2)", border: "3px solid var(--color-bg)" }}>
            {merchant.user.avatar ? (
              <Image src={merchant.user.avatar} alt={merchant.storeName} fill className="object-cover" />
            ) : (
              <span className="w-full h-full flex items-center justify-center text-xl font-bold font-display" style={{ color: "var(--color-primary)" }}>
                {getInitials(merchant.storeName)}
              </span>
            )}
          </div>
          <div className="pb-1">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold">{merchant.storeName}</h1>
              {merchant.isVerified && <BadgeCheck size={20} style={{ color: "var(--color-primary)" }} />}
            </div>
            {merchant.totalRatings > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <RatingStars value={merchant.rating} size={13} />
                <span className="text-sm font-semibold">{merchant.rating.toFixed(1)}</span>
                <span className="text-sm" style={{ color: "var(--color-text-3)" }}>({merchant.totalRatings} reviews)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Package, label: "Products", value: products.length },
          { icon: Star, label: "Rating", value: merchant.rating.toFixed(1) },
          { icon: Package, label: "Sales", value: merchant.totalSales },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="p-4 rounded-2xl text-center"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <p className="font-display text-xl font-bold">{value}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-3)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Products */}
      <div>
        <h2 className="font-display text-xl font-bold mb-4">Products</h2>
        <ProductGrid products={products} />
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div>
          <h2 className="font-display text-xl font-bold mb-4">Customer reviews</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {(reviews as ReviewWithBuyer[]).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
