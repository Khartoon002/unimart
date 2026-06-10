"use client";

import { ProductCard } from "./ProductCard";
import { EmptyState } from "./EmptyState";
import { useCart } from "@/hooks/useCart";
import { toggleSavedProduct } from "@/server/actions/user.actions";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import type { MeilisearchProduct } from "@/types";

interface ProductGridProps {
  products: MeilisearchProduct[];
  view?: "grid" | "list";
  savedIds?: string[];
  emptyTitle?: string;
  emptyDescription?: string;
}

export function ProductGrid({ products, view = "grid", savedIds = [], emptyTitle = "No products found", emptyDescription = "Try adjusting your search or filters." }: ProductGridProps) {
  const { addToCart } = useCart();
  const { data: session } = useSession();
  const [localSaved, setLocalSaved] = useState<Set<string>>(new Set(savedIds));

  async function handleSave(product: MeilisearchProduct) {
    if (!session) return;
    setLocalSaved((prev) => {
      const next = new Set(prev);
      if (next.has(product.id)) next.delete(product.id);
      else next.add(product.id);
      return next;
    });
    await toggleSavedProduct(product.id);
  }

  if (!products.length) {
    return <EmptyState icon={ShoppingBag} title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className={
      view === "grid"
        ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4"
        : "flex flex-col gap-3"
    }>
      {products.map((product, i) => (
        <ProductCard
          key={product.id}
          product={product}
          view={view}
          index={i}
          isSaved={localSaved.has(product.id)}
          onAdd={(p) => addToCart(p, 1)}
          onSave={handleSave}
        />
      ))}
    </div>
  );
}
