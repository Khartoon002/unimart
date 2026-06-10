"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, ShoppingBag, Trash2, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import { QtyStepper } from "@/components/unimart/QtyStepper";
import { formatPrice, calculatePlatformFee, calculateTotal } from "@/lib/utils";
import { DELIVERY_FEE } from "@/lib/constants";

export function CartDrawer() {
  const open = useUIStore((s) => s.cartDrawerOpen);
  const close = useUIStore((s) => s.closeCartDrawer);
  const { items, removeItem, updateQuantity, subtotal } = useCartStore();

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, close]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const fee = calculatePlatformFee(subtotal);
  const total = calculateTotal(subtotal, fee, DELIVERY_FEE);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            className="fixed inset-0 z-[60]"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}
          />

          {/* Drawer panel */}
          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 bottom-0 z-[61] flex flex-col w-full max-w-sm"
            style={{ background: "var(--color-bg)", borderLeft: "1px solid var(--color-border)", boxShadow: "var(--shadow-modal)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 h-16 flex-shrink-0"
              style={{ borderBottom: "1px solid var(--color-border)" }}>
              <div className="flex items-center gap-2.5">
                <ShoppingCart size={18} style={{ color: "var(--color-primary)" }} />
                <span className="font-display font-bold text-base">Cart</span>
                {items.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{ background: "var(--color-primary)", color: "#fff" }}>
                    {items.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </div>
              <button onClick={close} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "var(--color-surface-2)", color: "var(--color-text-2)" }}>
                <X size={16} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
                  <ShoppingBag size={40} style={{ color: "var(--color-text-3)" }} />
                  <p className="font-medium text-sm" style={{ color: "var(--color-text-2)" }}>Your cart is empty</p>
                  <Link href="/marketplace" onClick={close}>
                    <button className="h-9 px-5 rounded-full text-sm font-semibold"
                      style={{ background: "var(--color-primary)", color: "#fff" }}>
                      Browse products
                    </button>
                  </Link>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 40 }}
                      transition={{ duration: 0.18 }}
                      className="flex gap-3 p-3 rounded-2xl"
                      style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
                    >
                      {/* Thumbnail */}
                      <Link href={`/product/${item.productId}`} onClick={close} className="flex-shrink-0">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden"
                          style={{ background: "var(--color-surface-2)" }}>
                          {item.image && (
                            <Image src={item.image} alt={item.title} fill className="object-cover" />
                          )}
                        </div>
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <Link href={`/product/${item.productId}`} onClick={close}>
                          <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                        </Link>
                        {item.variantLabel && (
                          <p className="text-xs" style={{ color: "var(--color-text-3)" }}>{item.variantLabel}</p>
                        )}
                        <p className="text-sm font-bold" style={{ color: "var(--color-primary)" }}>
                          {formatPrice(item.price)}
                        </p>
                        <div className="flex items-center justify-between">
                          <QtyStepper
                            value={item.quantity}
                            max={item.stock}
                            onChange={(q) => updateQuantity(item.productId, q)}
                            size="sm"
                          />
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                            style={{ color: "var(--color-danger)" }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer summary + CTA */}
            {items.length > 0 && (
              <div className="flex-shrink-0 px-5 py-4 space-y-3"
                style={{ borderTop: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
                <div className="space-y-1.5">
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
                  <div className="flex justify-between font-bold text-base pt-2"
                    style={{ borderTop: "1px solid var(--color-border)" }}>
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <Link href="/checkout" onClick={close} className="block">
                  <button className="w-full h-12 rounded-2xl font-bold flex items-center justify-center gap-2"
                    style={{ background: "var(--color-primary)", color: "#fff" }}>
                    <ShoppingCart size={16} />
                    Checkout · {formatPrice(total)}
                  </button>
                </Link>

                <Link href="/cart" onClick={close} className="block text-center text-sm font-medium"
                  style={{ color: "var(--color-text-3)" }}>
                  View full cart
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
