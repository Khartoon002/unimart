"use client";

import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import type { MeilisearchProduct } from "@/types";

export function useCart() {
  const store = useCartStore();
  const openCartDrawer = useUIStore((s) => s.openCartDrawer);

  function addToCart(product: MeilisearchProduct, quantity = 1, variantOptionId?: string, variantLabel?: string) {
    store.addItem({
      productId: product.id,
      title: product.title,
      image: product.images[0] ?? "",
      price: product.price,
      merchantId: product.merchantId,
      merchantName: product.merchantStoreName,
      quantity,
      stock: product.stock,
      variantOptionId,
      variantLabel,
    });
    openCartDrawer();
  }

  return { ...store, addToCart };
}
