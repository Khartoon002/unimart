"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { QtyStepper } from "./QtyStepper";
import { useCart } from "@/hooks/useCart";

interface Product { id: string; title: string; price: number; images: string[]; stock: number; merchantId: string; merchantStoreName?: string }

export function AddToCartButton({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();

  const outOfStock = product.stock === 0;

  return (
    <div className="flex items-center gap-3">
      <QtyStepper value={qty} max={product.stock} onChange={setQty} />
      <button
        onClick={() => addToCart({ ...product, merchantStoreName: product.merchantStoreName ?? "" } as Parameters<typeof addToCart>[0], qty)}
        disabled={outOfStock}
        className="flex-1 h-12 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-40"
        style={{ background: "var(--color-accent)", color: "#1A1500" }}>
        <ShoppingCart size={18} />
        {outOfStock ? "Out of stock" : "Add to cart"}
      </button>
    </div>
  );
}
