"use client";

import { useState, useCallback } from "react";
import { useProducts } from "@/hooks/useProducts";
import { ProductGrid } from "@/components/unimart/ProductGrid";
import { FilterSidebar } from "@/components/unimart/FilterSidebar";
import { SearchBar } from "@/components/unimart/SearchBar";
import { useDebounce } from "@/hooks/useDebounce";
import { LayoutGrid, List, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

type Filters = {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isPerishable?: boolean;
};

const QUICK_CATS = [
  { value: "", label: "All" },
  ...PRODUCT_CATEGORIES.slice(0, 7).map((c) => ({ value: c.value, label: c.label })),
];

export default function MarketplacePage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>({});
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filterOpen, setFilterOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 350);

  const { data, isLoading } = useProducts(debouncedQuery, filters);
  const products = data?.hits ?? [];

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold">Marketplace</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-text-2)" }}>
          {data?.totalHits ? `${data.totalHits.toLocaleString()} products` : "Browse all products"}
        </p>
      </div>

      {/* ── Search + view controls ── */}
      <div className="flex items-center gap-2">
        <SearchBar defaultValue={query} onSearch={setQuery} className="flex-1" />

        {/* Mobile filter toggle */}
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className="flex items-center gap-1.5 h-12 px-3 rounded-2xl text-sm font-semibold flex-shrink-0 xl:hidden relative"
          style={{
            background: filterOpen ? "var(--color-primary)" : "var(--color-surface)",
            border: `1px solid ${filterOpen ? "var(--color-primary)" : "var(--color-border)"}`,
            color: filterOpen ? "#fff" : "var(--color-text-1)",
          }}
        >
          <SlidersHorizontal size={15} />
          <span className="text-xs font-semibold">Filter</span>
          {activeFilterCount > 0 && !filterOpen && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
              style={{ background: "var(--color-primary)", color: "#fff" }}>
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Desktop view toggle */}
        <div className="hidden sm:flex items-center rounded-xl overflow-hidden flex-shrink-0"
          style={{ border: "1px solid var(--color-border)" }}>
          {(["grid", "list"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className="h-10 w-10 flex items-center justify-center transition-colors"
              style={{
                background: view === v ? "var(--color-primary-soft)" : "transparent",
                color: view === v ? "var(--color-primary)" : "var(--color-text-3)",
              }}>
              {v === "grid" ? <LayoutGrid size={16} /> : <List size={16} />}
            </button>
          ))}
        </div>
      </div>

      {/* ── Quick category chips — horizontal scroll ── */}
      <div className="flex gap-2 overflow-x-auto pb-0.5 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-none">
        {QUICK_CATS.map((cat) => {
          const active = cat.value === "" ? !filters.category : filters.category === cat.value;
          return (
            <button
              key={cat.value || "all"}
              onClick={() => setFilters({ ...filters, category: cat.value || undefined })}
              className="flex-shrink-0 px-4 h-8 rounded-full text-sm font-semibold transition-colors"
              style={{
                background: active ? "var(--color-primary)" : "var(--color-surface)",
                border: `1px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`,
                color: active ? "#fff" : "var(--color-text-2)",
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* ── Mobile filter drawer — full-width, ABOVE the product grid ── */}
      <AnimatePresence>
        {filterOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden xl:hidden"
          >
            <FilterSidebar
              filters={filters}
              onChange={setFilters}
              onClose={() => setFilterOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main content: sidebar (desktop) + grid ── */}
      <div className="flex gap-8">
        {/* Desktop filter sidebar — only in the flex row on xl+ */}
        <div className="hidden xl:block">
          <FilterSidebar filters={filters} onChange={setFilters} />
        </div>

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="rounded-2xl animate-pulse"
                  style={{ background: "var(--color-surface)", aspectRatio: "1/1" }} />
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
