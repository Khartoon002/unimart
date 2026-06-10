import { MeiliSearch } from "meilisearch";
import type { Product, MerchantProfile, User } from "@prisma/client";

export const meilisearch = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST ?? "http://localhost:7700",
  apiKey: process.env.MEILISEARCH_API_KEY ?? "masterkey",
});

export async function setupIndexes() {
  try {
    const index = meilisearch.index("products");

    await meilisearch.createIndex("products", { primaryKey: "id" });

    await index.updateSettings({
      searchableAttributes: [
        "title",
        "description",
        "tags",
        "merchantStoreName",
        "category",
      ],
      filterableAttributes: [
        "category",
        "status",
        "isPerishable",
        "price",
        "rating",
        "merchantId",
        "faculty",
      ],
      sortableAttributes: ["price", "createdAt", "rating", "orderCount"],
      rankingRules: [
        "words",
        "typo",
        "proximity",
        "attribute",
        "sort",
        "exactness",
        "rating:desc",
        "orderCount:desc",
      ],
      typoTolerance: {
        minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 },
      },
    });
  } catch {
    // Index may already exist
  }
}

type ProductWithMerchant = Product & {
  merchant: MerchantProfile & { user: User };
};

export async function syncProductToIndex(product: ProductWithMerchant) {
  try {
    const index = meilisearch.index("products");
    await index.addDocuments([
      {
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price.toNumber ? product.price.toNumber() : Number(product.price),
        compareAtPrice: product.compareAtPrice
          ? Number(product.compareAtPrice)
          : null,
        category: product.category,
        tags: product.tags,
        images: product.images,
        stock: product.stock,
        status: product.status,
        isPerishable: product.isPerishable,
        expiresAt: product.expiresAt?.toISOString() ?? null,
        rating: product.rating,
        reviewCount: product.reviewCount,
        orderCount: product.orderCount,
        merchantId: product.merchantId,
        merchantStoreName: product.merchant.storeName,
        merchantAvatar: product.merchant.user.avatar,
        merchantVerified: product.merchant.isVerified,
        faculty: product.merchant.user.faculty,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      },
    ]);
  } catch (e) {
    console.error("Meilisearch sync error:", e);
  }
}

export async function removeProductFromIndex(id: string) {
  try {
    const index = meilisearch.index("products");
    await index.deleteDocument(id);
  } catch (e) {
    console.error("Meilisearch delete error:", e);
  }
}

export interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  isPerishable?: boolean;
  inStock?: boolean;
  faculty?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export async function searchProducts(query: string, filters: SearchFilters = {}) {
  const index = meilisearch.index("products");

  const filterParts: string[] = [`status = "ACTIVE"`];

  if (filters.category) filterParts.push(`category = "${filters.category}"`);
  if (filters.minPrice != null) filterParts.push(`price >= ${filters.minPrice}`);
  if (filters.maxPrice != null) filterParts.push(`price <= ${filters.maxPrice}`);
  if (filters.minRating != null) filterParts.push(`rating >= ${filters.minRating}`);
  if (filters.isPerishable != null)
    filterParts.push(`isPerishable = ${filters.isPerishable}`);
  if (filters.inStock) filterParts.push(`stock > 0`);
  if (filters.faculty) filterParts.push(`faculty = "${filters.faculty}"`);

  const sortMap: Record<string, string> = {
    "price_asc": "price:asc",
    "price_desc": "price:desc",
    "rating_desc": "rating:desc",
    "newest": "createdAt:desc",
  };

  const sort = filters.sort && sortMap[filters.sort] ? [sortMap[filters.sort]] : [];

  const result = await index.search(query || "", {
    filter: filterParts.join(" AND "),
    sort,
    page: filters.page ?? 1,
    hitsPerPage: filters.limit ?? 24,
  });

  return result;
}
