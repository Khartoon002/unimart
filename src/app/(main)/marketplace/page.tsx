"use client";

import { useState, useCallback } from "react";
import { useProducts } from "@/hooks/useProducts";
import { ProductGrid } from "@/components/unimart/ProductGrid";
import { FilterSidebar } from "@/components/unimart/FilterSidebar";
import { SearchBar } from "@/components/unimart/SearchBar";
import { useDebounce } from "@/hooks/useDebounce";
import { LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

type Filters = {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isPerishable?: boolean;
};

export default function MarketplacePage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>({});
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filterOpen, setFilterOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 350);

  const { data, isLoading } = useProducts(debouncedQuery, filters);
  const products = data?.hits ?? [];

  const QUICK_CATS = [{ value: "All", label: "All" }, ...PRODUCT_CATEGORIES.slice(0, 6).map((c) => ({ value: c.value, label: c.label }))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold">Marketplace</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-text-2)" }}>
          {data?.totalHits ? `${data.totalHits.toLocaleString()} products` : "Browse all products"}
        </p>
      </div>

      {/* Search + controls */}
      <div className="flex items-center gap-3">
        <SearchBar
          defaultValue={query}
          onSearch={setQuery}
          className="flex-1"
        />
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className="flex items-center gap-2 h-12 px-4 rounded-2xl text-sm font-semibold flex-shrink-0 transition-colors md:hidden"
          style={{ background: filterOpen ? "var(--color-primary)" : "var(--color-surface)", border: "1px solid var(--color-border)", color: filterOpen ? "#fff" : "var(--color-text-1)" }}>
          <SlidersHorizontal size={16} />
        </button>
        <div className="hidden md:flex items-center rounded-xl overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
          {(["grid", "list"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className="h-10 w-10 flex items-center justify-center transition-colors"
              style={{ background: view === v ? "var(--color-primary-soft)" : "transparent", color: view === v ? "var(--color-primary)" : "var(--color-text-3)" }}>
              {v === "grid" ? <LayoutGrid size={16} /> : <List size={16} />}
            </button>
          ))}
        </div>
      </div>

      {/* Quick category chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0">
        {QUICK_CATS.map((cat) => {
          const isAll = cat.value === "All";
          const active = isAll ? !filters.category : filters.category === cat.value;
          return (
            <button key={cat.value}
              onClick={() => setFilters({ ...filters, category: isAll ? undefined : cat.value })}
              className="flex-shrink-0 px-4 h-8 rounded-full text-sm font-medium transition-colors"
              style={{
                background: active ? "var(--color-primary)" : "var(--color-surface)",
                border: `1px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`,
                color: active ? "#fff" : "var(--color-text-2)",
              }}>
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex gap-8">
        {/* Desktop filter sidebar */}
        <div className="hidden md:block">
          <FilterSidebar filters={filters} onChange={setFilters} />
        </div>

        {/* Mobile filter drawer */}
        <AnimatePresence>
          {filterOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden w-full">
              <FilterSidebar filters={filters} onChange={setFilters} onClose={() => setFilterOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className={view === "grid" ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" : "space-y-3"}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="rounded-2xl animate-pulse" style={{ background: "var(--color-surface)", aspectRatio: view === "grid" ? "4/5" : undefined, height: view === "list" ? 88 : undefined }} />
              ))}
            </div>
          ) : (
            <ProductGrid products={products} view={view} />
          )}
        </div>
      </div>
    </div>
  );
}
