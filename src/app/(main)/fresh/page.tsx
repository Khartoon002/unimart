"use client";

import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { ProductGrid } from "@/components/unimart/ProductGrid";
import { Leaf, Clock } from "lucide-react";
import { motion } from "framer-motion";

const SORT_OPTIONS = [
  { value: "expiresAt:asc", label: "Expiring soon" },
  { value: "price:asc", label: "Price: low to high" },
  { value: "price:desc", label: "Price: high to low" },
  { value: "createdAt:desc", label: "Newest" },
];

export default function FreshMarketPage() {
  const [sort, setSort] = useState("expiresAt:asc");
  const { data, isLoading } = useProducts("", { isPerishable: true });
  const products = data?.hits ?? [];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl overflow-hidden p-8 relative"
        style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--color-fresh) 20%, transparent), color-mix(in srgb, var(--color-fresh) 5%, var(--color-surface)))" }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center animate-fresh-pulse"
            style={{ background: "color-mix(in srgb, var(--color-fresh) 20%, transparent)" }}>
            <Leaf size={20} style={{ color: "var(--color-fresh)" }} />
          </div>
          <span className="font-bold text-sm uppercase tracking-widest" style={{ color: "var(--color-fresh)" }}>Fresh Market</span>
        </div>
        <h1 className="font-display text-3xl font-bold">Time-limited deals</h1>
        <p className="mt-2 max-w-md text-sm" style={{ color: "var(--color-text-2)" }}>
          Perishable goods from student sellers — food, baked goods, homemade snacks. Get them before they expire!
        </p>
        <div className="flex items-center gap-2 mt-4">
          <Clock size={14} style={{ color: "var(--color-fresh)" }} />
          <span className="text-sm font-medium" style={{ color: "var(--color-fresh)" }}>
            {products.length} active listing{products.length !== 1 ? "s" : ""} right now
          </span>
        </div>
      </motion.div>

      {/* Sort controls */}
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: "var(--color-text-2)" }}>
          {isLoading ? "Loading…" : `${products.length} products available`}
        </p>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="h-9 px-3 rounded-xl text-sm outline-none"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }}>
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl animate-pulse" style={{ background: "var(--color-surface)", aspectRatio: "4/5" }} />
          ))}
        </div>
      ) : (
        <ProductGrid
          products={products}
          emptyTitle="No fresh listings right now"
          emptyDescription="Check back later — new time-limited products are added daily."
        />
      )}
    </div>
  );
}
