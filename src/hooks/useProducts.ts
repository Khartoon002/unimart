"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import type { SearchFilters } from "@/lib/meilisearch";
import type { MeilisearchProduct } from "@/types";

interface SearchResponse {
  hits: MeilisearchProduct[];
  totalHits: number;
  page: number;
  totalPages: number;
  processingTimeMs: number;
}

async function fetchProducts(
  q: string,
  filters: SearchFilters,
  page = 1
): Promise<SearchResponse> {
  const params = new URLSearchParams({ q, page: String(page) });
  if (filters.category) params.set("category", filters.category);
  if (filters.minPrice != null) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice != null) params.set("maxPrice", String(filters.maxPrice));
  if (filters.minRating != null) params.set("minRating", String(filters.minRating));
  if (filters.isPerishable != null) params.set("isPerishable", String(filters.isPerishable));
  if (filters.inStock) params.set("inStock", "true");
  if (filters.faculty) params.set("faculty", filters.faculty);
  if (filters.sort) params.set("sort", filters.sort);

  const res = await fetch(`/api/search?${params}`);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export function useProducts(q = "", filters: SearchFilters = {}) {
  return useQuery({
    queryKey: ["products", q, filters],
    queryFn: () => fetchProducts(q, filters),
    staleTime: 60_000,
  });
}

export function useInfiniteProducts(q = "", filters: SearchFilters = {}) {
  return useInfiniteQuery({
    queryKey: ["products-infinite", q, filters],
    queryFn: ({ pageParam }) => fetchProducts(q, filters, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page < last.totalPages ? last.page + 1 : undefined,
    staleTime: 60_000,
  });
}
