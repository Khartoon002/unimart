import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { incrementProductView } from "@/server/actions/product.actions";
import { ProductImageGallery } from "@/components/unimart/ProductImageGallery";
import { PriceTag } from "@/components/unimart/PriceTag";
import { CountdownTimer } from "@/components/unimart/CountdownTimer";
import { MerchantBadge } from "@/components/unimart/MerchantBadge";
import { ReviewCard } from "@/components/unimart/ReviewCard";
import { RatingStars } from "@/components/unimart/RatingStars";
import { StatusBadge } from "@/components/unimart/StatusBadge";
import { AddToCartButton } from "@/components/unimart/AddToCartButton";
import { Leaf, Eye, Package } from "lucide-react";
import type { ReviewWithBuyer } from "@/types";

interface Props { params: Promise<{ id: string }> }

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      merchant: { include: { user: { select: { id: true, name: true, avatar: true } } } },
      variants: { include: { options: true } },
      reviews: {
        include: { buyer: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!product) notFound();

  // Non-owners can only see active products
  const isOwner = session?.user?.id === product.merchant.userId;
  if (product.status !== "ACTIVE" && !isOwner) notFound();

  // Fire-and-forget view count
  incrementProductView(id).catch(() => {});

  // Serialize Decimal fields — Next.js 16 RSC validates the entire render tree
  const price = Number(product.price);
  const compareAtPrice = product.compareAtPrice != null ? Number(product.compareAtPrice) : undefined;

  const isSold = product.stock === 0;
  const isExpired = product.isPerishable && product.expiresAt && new Date(product.expiresAt) <= new Date();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Gallery */}
        <ProductImageGallery images={product.images} title={product.title} />

        {/* Details */}
        <div className="space-y-6">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={product.status} />
            {product.isPerishable && !isExpired && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: "color-mix(in srgb, var(--color-fresh) 15%, transparent)", color: "var(--color-fresh)", border: "1px solid var(--color-fresh)" }}>
                <Leaf size={11} /> Fresh Market
              </span>
            )}
          </div>

          <div>
            <h1 className="font-display text-2xl font-bold leading-tight">{product.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              {product.reviewCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <RatingStars value={product.rating} size={13} />
                  <span className="text-sm font-semibold">{product.rating.toFixed(1)}</span>
                  <span className="text-sm" style={{ color: "var(--color-text-3)" }}>({product.reviewCount} reviews)</span>
                </div>
              )}
              <div className="flex items-center gap-1" style={{ color: "var(--color-text-3)" }}>
                <Eye size={13} />
                <span className="text-xs">{product.viewCount.toLocaleString()} views</span>
              </div>
            </div>
          </div>

          <PriceTag price={price} compareAt={compareAtPrice} size="lg" />

          {/* Stock */}
          <div className="flex items-center gap-2">
            <Package size={14} style={{ color: isSold ? "var(--color-danger)" : "var(--color-fresh)" }} />
            <span className="text-sm font-medium" style={{ color: isSold ? "var(--color-danger)" : "var(--color-fresh)" }}>
              {isSold ? "Out of stock" : `${product.stock} in stock`}
            </span>
          </div>

          {/* Fresh countdown */}
          {product.isPerishable && product.expiresAt && !isExpired && (
            <div className="flex items-center justify-between p-4 rounded-2xl"
              style={{ background: "color-mix(in srgb, var(--color-fresh) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--color-fresh) 30%, transparent)" }}>
              <span className="text-sm font-medium" style={{ color: "var(--color-fresh)" }}>Expires in</span>
              <CountdownTimer expiresAt={product.expiresAt} size="base" />
            </div>
          )}

          {/* Add to cart — placed before description so it's reachable on mobile */}
          {isOwner ? (
            <div className="flex items-center gap-2.5 h-12 px-4 rounded-2xl text-sm font-medium"
              style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text-3)" }}>
              <Package size={15} />
              This is your listing — you can&apos;t purchase your own item
            </div>
          ) : !isExpired && (
            <AddToCartButton product={{ id: product.id, title: product.title, price, images: product.images, stock: product.stock, merchantId: product.merchantId, merchantStoreName: product.merchant.storeName }} />
          )}

          {/* Variants */}
          {product.variants.length > 0 && (
            <div className="space-y-4 pt-1">
              {product.variants.map((variant) => (
                <div key={variant.id}>
                  <h3 className="font-semibold mb-2 text-sm">{variant.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {variant.options.map((opt) => (
                      <div key={opt.id} className="px-3 py-1.5 rounded-xl text-sm font-medium"
                        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                        {opt.label}
                        {opt.price != null && Number(opt.price) > 0 && (
                          <span style={{ color: "var(--color-text-3)" }}> (+₦{Number(opt.price).toLocaleString()})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div>
              <h3 className="font-semibold mb-2">About this item</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-2)" }}>{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Merchant info */}
      <div className="p-6 rounded-2xl" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <h2 className="font-semibold mb-4">Sold by</h2>
        <MerchantBadge
          merchant={{
            id: product.merchantId,
            storeName: product.merchant.storeName,
            isVerified: product.merchant.isVerified,
            rating: product.merchant.rating,
            user: { avatar: product.merchant.user.avatar, name: product.merchant.user.name ?? "" },
          }}
          asLink
        />
      </div>

      {/* Reviews */}
      {product.reviews.length > 0 && (
        <div>
          <h2 className="font-display text-xl font-bold mb-4">Customer reviews</h2>
          <div className="space-y-3">
            {(product.reviews as ReviewWithBuyer[]).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
