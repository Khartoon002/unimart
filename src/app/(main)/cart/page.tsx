"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Trash2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { QtyStepper } from "@/components/unimart/QtyStepper";
import { PriceTag } from "@/components/unimart/PriceTag";
import { EmptyState } from "@/components/unimart/EmptyState";
import { formatPrice, calculatePlatformFee, calculateTotal } from "@/lib/utils";
import { DELIVERY_FEE } from "@/lib/constants";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Discover products from student merchants around campus."
        action={{ label: "Browse marketplace", href: "/marketplace" }}
      />
    );
  }

  const fee = calculatePlatformFee(subtotal);
  const total = calculateTotal(subtotal, fee, DELIVERY_FEE);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Shopping cart ({items.length})</h1>
        <button onClick={clearCart} className="text-sm" style={{ color: "var(--color-danger)" }}>Clear all</button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -40 }}
                className="flex gap-4 p-4 rounded-2xl"
                style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                <Link href={`/product/${item.productId}`} className="flex-shrink-0">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden" style={{ background: "var(--color-surface-2)" }}>
                    {item.image && <Image src={item.image} alt={item.title} fill className="object-cover" />}
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.productId}`}>
                    <h3 className="font-medium text-sm line-clamp-1">{item.title}</h3>
                  </Link>
                  {item.variantLabel && (
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-3)" }}>{item.variantLabel}</p>
                  )}
                  <PriceTag price={item.price} size="sm" className="mt-1" />
                  <div className="flex items-center justify-between mt-3">
                    <QtyStepper value={item.quantity} max={99} onChange={(q) => updateQuantity(item.productId, q)} size="sm" />
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-sm">{formatPrice(item.price * item.quantity)}</span>
                      <button onClick={() => removeItem(item.productId)} style={{ color: "var(--color-danger)" }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl p-5 sticky top-20 space-y-4"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <h2 className="font-semibold text-lg">Order summary</h2>
            <div className="space-y-2.5">
              {[
                { label: "Subtotal", value: formatPrice(subtotal) },
                { label: "Delivery", value: formatPrice(DELIVERY_FEE) },
                { label: "Platform fee", value: formatPrice(fee) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span style={{ color: "var(--color-text-2)" }}>{label}</span>
                  <span>{value}</span>
                </div>
              ))}
              <div className="pt-2 flex justify-between font-bold text-base" style={{ borderTop: "1px solid var(--color-border)" }}>
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <Link href="/checkout">
              <button className="w-full h-12 rounded-2xl font-semibold flex items-center justify-center"
                style={{ background: "var(--color-primary)", color: "#fff" }}>
                Proceed to checkout
              </button>
            </Link>
            <Link href="/marketplace">
              <p className="text-center text-xs" style={{ color: "var(--color-text-3)" }}>← Continue shopping</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
