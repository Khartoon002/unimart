"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, BadgeCheck, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PriceTag } from "./PriceTag";
import { CountdownTimer } from "./CountdownTimer";
import type { MeilisearchProduct } from "@/types";

interface ProductCardProps {
  product: MeilisearchProduct;
  onAdd?: (product: MeilisearchProduct) => void;
  onSave?: (product: MeilisearchProduct) => void;
  isSaved?: boolean;
  view?: "grid" | "list";
  index?: number;
}

export function ProductCard({ product, onAdd, onSave, isSaved, view = "grid", index = 0 }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const isExpired = product.isPerishable && product.expiresAt && new Date(product.expiresAt) <= new Date();
  const outOfStock = product.stock === 0;

  if (view === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        className="flex gap-4 p-3 rounded-2xl transition-shadow"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Link href={`/product/${product.id}`} className="flex-shrink-0">
          <div className="relative w-28 h-20 rounded-xl overflow-hidden" style={{ background: "var(--color-surface-2)" }}>
            {product.images[0] && <Image src={product.images[0]} alt={product.title} fill className="object-cover" />}
          </div>
        </Link>
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            <Link href={`/product/${product.id}`}>
              <h3 className="text-sm font-medium leading-snug line-clamp-1" style={{ color: "var(--color-text-1)" }}>{product.title}</h3>
            </Link>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs truncate" style={{ color: "var(--color-text-2)" }}>{product.merchantStoreName}</span>
              {product.merchantVerified && <BadgeCheck size={11} style={{ color: "var(--color-primary)" }} />}
            </div>
          </div>
          <PriceTag price={product.price} compareAt={product.compareAtPrice} size="sm" />
        </div>
        <div className="flex items-center">
          <button
            onClick={(e) => { e.preventDefault(); onAdd?.(product); }}
            disabled={outOfStock}
            className="h-9 px-4 rounded-full text-xs font-semibold flex items-center gap-1.5"
            style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }}
          >
            <ShoppingCart size={13} /> Add
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.045, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -4 }}
      className="rounded-2xl overflow-hidden cursor-pointer"
      style={{
        background: "var(--color-surface)",
        boxShadow: hovered ? "var(--shadow-hover)" : "var(--shadow-card)",
        transition: "box-shadow 220ms",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
        <Link href={`/product/${product.id}`}>
          <motion.div className="relative w-full h-full" animate={{ scale: hovered ? 1.05 : 1 }} transition={{ duration: 0.38 }}>
            <div className="relative w-full h-full" style={{ background: "var(--color-surface-2)" }}>
              {product.images[0] && (
                <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
              )}
            </div>
          </motion.div>
        </Link>

        {/* Sold out overlay */}
        {(outOfStock || isExpired) && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(12,12,15,0.65)", backdropFilter: "blur(2px)" }}>
            <span className="text-sm font-bold" style={{ color: "var(--color-text-2)" }}>{isExpired ? "Expired" : "Sold out"}</span>
          </div>
        )}

        {/* Fresh badge */}
        {product.isPerishable && !isExpired && (
          <span className="absolute bottom-2 left-2 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
            style={{ background: "rgba(12,12,15,0.8)", backdropFilter: "blur(6px)", color: "var(--color-fresh)", border: "1px solid var(--color-fresh)" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--color-fresh)" }} />
            Fresh
          </span>
        )}

        {/* Discount badge */}
        {product.compareAtPrice && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-bold"
            style={{ background: "var(--color-accent)", color: "#1A1500" }}>
            -{Math.round((1 - product.price / product.compareAtPrice) * 100)}%
          </span>
        )}

        {/* Save button */}
        <button
          onClick={(e) => { e.preventDefault(); onSave?.(product); }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90"
          style={{ background: "rgba(12,12,15,0.72)", backdropFilter: "blur(6px)", color: isSaved ? "var(--color-danger)" : "var(--color-text-1)" }}
        >
          <Heart size={15} style={{ fill: isSaved ? "var(--color-danger)" : "none" }} />
        </button>

        {/* Add to Cart hover button */}
        <AnimatePresence>
          {hovered && !outOfStock && !isExpired && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute bottom-2 left-2 right-2"
            >
              <button
                onClick={(e) => { e.preventDefault(); onAdd?.(product); }}
                className="w-full h-9 rounded-full font-semibold text-xs flex items-center justify-center gap-1.5"
                style={{ background: "var(--color-accent)", color: "#1A1500" }}
              >
                <ShoppingCart size={14} /> Add to Cart
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info */}
      <Link href={`/product/${product.id}`}>
        <div className="p-3.5">
          <div className="flex items-center gap-1.5 mb-2">
            {product.merchantAvatar && (
              <Image src={product.merchantAvatar} alt="" width={18} height={18} className="rounded-full object-cover flex-shrink-0" />
            )}
            <span className="text-xs truncate" style={{ color: "var(--color-text-2)" }}>{product.merchantStoreName}</span>
            {product.merchantVerified && <BadgeCheck size={12} style={{ color: "var(--color-primary)", flexShrink: 0 }} />}
          </div>

          <h3 className="text-sm font-medium leading-snug line-clamp-2 mb-2.5" style={{ color: "var(--color-text-1)", minHeight: "2.5rem" }}>
            {product.title}
          </h3>

          <div className="flex items-center justify-between">
            <PriceTag price={product.price} compareAt={product.compareAtPrice} size="sm" />
            {product.stock <= 3 && product.stock > 0 && (
              <span className="text-xs font-semibold" style={{ color: "var(--color-warning)" }}>{product.stock} left</span>
            )}
          </div>

          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1 mt-1.5">
              <Star size={11} style={{ fill: "var(--color-accent)", color: "var(--color-accent)" }} />
              <span className="text-xs font-semibold" style={{ color: "var(--color-accent)" }}>{product.rating.toFixed(1)}</span>
              <span className="text-xs" style={{ color: "var(--color-text-3)" }}>({product.reviewCount})</span>
            </div>
          )}

          {product.isPerishable && product.expiresAt && !isExpired && (
            <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: "1px solid var(--color-border)" }}>
              <span className="text-xs" style={{ color: "var(--color-text-3)" }}>Expires in</span>
              <CountdownTimer expiresAt={product.expiresAt} size="sm" />
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}