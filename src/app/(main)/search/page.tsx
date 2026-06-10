"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useProducts } from "@/hooks/useProducts";
import { ProductGrid } from "@/components/unimart/ProductGrid";
import { FilterSidebar } from "@/components/unimart/FilterSidebar";
import { SearchBar } from "@/components/unimart/SearchBar";
import { LayoutGrid, List } from "lucide-react";

type Filters = { category?: string; minPrice?: number; maxPrice?: number; inStock?: boolean; isPerishable?: boolean };

function SearchResults() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQ);
  const [filters, setFilters] = useState<Filters>({});
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => { setQuery(searchParams.get("q") ?? ""); }, [searchParams]);

  const { data, isLoading } = useProducts(query, filters);
  const products = data?.hits ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">
          {query ? `Results for "${query}"` : "Browse products"}
        </h1>
        {data && <p className="text-sm mt-0.5" style={{ color: "var(--color-text-2)" }}>{data.totalHits.toLocaleString()} products found</p>}
      </div>

      <div className="flex items-center gap-3">
        <SearchBar defaultValue={query} onSearch={setQuery} className="flex-1" />
        <div className="flex items-center rounded-xl overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
          {(["grid", "list"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className="h-10 w-10 flex items-center justify-center transition-colors"
              style={{ background: view === v ? "var(--color-primary-soft)" : "transparent", color: view === v ? "var(--color-primary)" : "var(--color-text-3)" }}>
              {v === "grid" ? <LayoutGrid size={16} /> : <List size={16} />}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-8">
        <div className="hidden md:block">
          <FilterSidebar filters={filters} onChange={setFilters} />
        </div>
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="rounded-2xl animate-pulse" style={{ background: "var(--color-surface)", aspectRatio: "4/5" }} />
              ))}
            </div>
          ) : (
            <ProductGrid products={products} view={view}
              emptyTitle={`No results for "${query}"`}
              emptyDescription="Try different keywords or remove some filters." />
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchResults />
    </Suspense>
  );
}
