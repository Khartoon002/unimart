import { NextRequest, NextResponse } from "next/server";
import { searchProducts, setupIndexes } from "@/lib/meilisearch";
import { prisma } from "@/lib/prisma";

let indexSetup = false;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? undefined;
  const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
  const minRating = searchParams.get("minRating") ? Number(searchParams.get("minRating")) : undefined;
  const isPerishable =
    searchParams.get("isPerishable") === "true"
      ? true
      : searchParams.get("isPerishable") === "false"
      ? false
      : undefined;
  const inStock = searchParams.get("inStock") === "true";
  const faculty = searchParams.get("faculty") ?? undefined;
  const sort = searchParams.get("sort") ?? undefined;
  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
  const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 24;

  // Try Meilisearch first
  try {
    if (!indexSetup) {
      await setupIndexes();
      indexSetup = true;
    }

    const result = await searchProducts(q, {
      category, minPrice, maxPrice, minRating,
      isPerishable, inStock, faculty, sort, page, limit,
    });

    return NextResponse.json({
      hits: result.hits,
      totalHits: result.totalHits,
      page: result.page,
      totalPages: Math.ceil((result.totalHits ?? 0) / limit),
      processingTimeMs: result.processingTimeMs,
    });
  } catch {
    // Meilisearch unavailable — fall back to Prisma direct query
  }

  try {
    const where: Record<string, unknown> = { status: "ACTIVE" };
    if (category) where.category = category;
    if (inStock) where.stock = { gt: 0 };
    if (isPerishable != null) where.isPerishable = isPerishable;
    if (minPrice != null || maxPrice != null) {
      where.price = {
        ...(minPrice != null && { gte: minPrice }),
        ...(maxPrice != null && { lte: maxPrice }),
      };
    }
    if (minRating != null) where.rating = { gte: minRating };
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    const orderBy: Record<string, string> =
      sort === "price_asc" ? { price: "asc" }
      : sort === "price_desc" ? { price: "desc" }
      : sort === "rating_desc" ? { rating: "desc" }
      : { createdAt: "desc" };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          merchant: { include: { user: { select: { avatar: true } } } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const hits = products.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description ?? "",
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice != null ? Number(p.compareAtPrice) : null,
      images: p.images,
      category: p.category,
      stock: p.stock,
      status: p.status,
      isPerishable: p.isPerishable,
      expiresAt: p.expiresAt?.toISOString() ?? null,
      rating: p.rating,
      reviewCount: p.reviewCount,
      merchantId: p.merchantId,
      merchantStoreName: p.merchant.storeName,
      merchantAvatar: p.merchant.user.avatar ?? null,
      merchantVerified: p.merchant.isVerified,
      tags: p.tags,
      createdAt: p.createdAt.toISOString(),
      viewCount: p.viewCount,
    }));

    return NextResponse.json({
      hits,
      totalHits: total,
      page,
      totalPages: Math.ceil(total / limit),
      processingTimeMs: 0,
    });
  } catch (e) {
    console.error("Search fallback error:", e);
    return NextResponse.json({ hits: [], totalHits: 0, page: 1, totalPages: 0 });
  }
}
