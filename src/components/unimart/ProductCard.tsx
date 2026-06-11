"use client";

import { useState } from "react";
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
  const canAdd = !outOfStock && !isExpired;

  /* ── List view ──────────────────────────────────────────────── */
  if (view === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        className="flex gap-3 p-3 rounded-2xl"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
      >
        <Link href={`/product/${product.id}`} className="flex-shrink-0">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden" style={{ background: "var(--color-surface-2)" }}>
            {product.images[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.images[0]} alt={product.title} className="absolute inset-0 w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
            )}
          </div>
        </Link>
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            <Link href={`/product/${product.id}`}>
              <h3 className="text-sm font-semibold leading-snug line-clamp-2" style={{ color: "var(--color-text-1)" }}>{product.title}</h3>
            </Link>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs truncate" style={{ color: "var(--color-text-3)" }}>{product.merchantStoreName}</span>
              {product.merchantVerified && <BadgeCheck size={11} style={{ color: "var(--color-primary)" }} />}
            </div>
          </div>
          <PriceTag price={product.price} compareAt={product.compareAtPrice} size="sm" />
        </div>
        <div className="flex flex-col items-end justify-between gap-2">
          <button
            onClick={(e) => { e.preventDefault(); onSave?.(product); }}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--color-surface-2)", color: isSaved ? "var(--color-danger)" : "var(--color-text-3)" }}
          >
            <Heart size={14} style={{ fill: isSaved ? "var(--color-danger)" : "none" }} />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); if (canAdd) onAdd?.(product); }}
            disabled={!canAdd}
            className="h-8 px-4 rounded-full text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 transition-opacity disabled:opacity-40"
            style={{ background: "var(--color-primary)", color: "#fff" }}
          >
            <ShoppingCart size={12} /> Add
          </button>
        </div>
      </motion.div>
    );
  }

  /* ── Grid view ──────────────────────────────────────────────── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, ease: [0.4, 0, 0.2, 1] }}
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: "var(--color-surface)",
        boxShadow: hovered ? "var(--shadow-hover)" : "var(--shadow-card)",
        transition: "box-shadow 200ms",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Image area ── */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "1 / 1" }}>
        <Link href={`/product/${product.id}`} className="block w-full h-full">
          <div className="relative w-full h-full" style={{ background: "var(--color-surface-2)" }}>
            {product.images[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.images[0]}
                alt={product.title}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ transform: hovered ? "scale(1.06)" : "scale(1)", transition: "transform 380ms ease" }}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            )}
          </div>
        </Link>

        {/* Sold-out overlay */}
        {(outOfStock || isExpired) && (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ background: "rgba(12,12,15,0.65)", backdropFilter: "blur(2px)" }}>
            <span className="text-sm font-bold" style={{ color: "var(--color-text-2)" }}>
              {isExpired ? "Expired" : "Sold out"}
            </span>
          </div>
        )}

        {/* Top row: discount badge (left) + save (right) */}
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between pointer-events-none">
          {product.compareAtPrice ? (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold pointer-events-auto"
              style={{ background: "var(--color-accent)", color: "#1A1500" }}>
              -{Math.round((1 - product.price / product.compareAtPrice) * 100)}%
            </span>
          ) : <span />}

          <button
            onClick={(e) => { e.preventDefault(); onSave?.(product); }}
            className="w-8 h-8 rounded-full flex items-center justify-center pointer-events-auto transition-transform active:scale-90"
            style={{ background: "rgba(12,12,15,0.72)", backdropFilter: "blur(6px)", color: isSaved ? "var(--color-danger)" : "#fff" }}
          >
            <Heart size={14} style={{ fill: isSaved ? "var(--color-danger)" : "none" }} />
          </button>
        </div>

        {/* Fresh badge */}
        {product.isPerishable && !isExpired && (
          <span className="absolute bottom-9 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold"
            style={{ background: "rgba(12,12,15,0.8)", color: "var(--color-fresh)", border: "1px solid var(--color-fresh)" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--color-fresh)" }} />
            Fresh
          </span>
        )}

        {/* Desktop: hover add-to-cart bar */}
        <AnimatePresence>
          {hovered && canAdd && (
            <motion.button
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => { e.preventDefault(); onAdd?.(product); }}
              className="absolute bottom-0 left-0 right-0 h-9 hidden md:flex items-center justify-center gap-2 text-xs font-bold"
              style={{ background: "var(--color-accent)", color: "#1A1500" }}
            >
              <ShoppingCart size={14} /> Add to Cart
            </motion.button>
          )}
        </AnimatePresence>

        {/* Mobile: always-visible add-to-cart bar */}
        <button
          onClick={(e) => { e.preventDefault(); if (canAdd) onAdd?.(product); }}
          disabled={!canAdd}
          className="absolute bottom-0 left-0 right-0 h-8 flex md:hidden items-center justify-center gap-1.5 text-xs font-bold transition-opacity disabled:opacity-50"
          style={{ background: canAdd ? "var(--color-accent)" : "var(--color-surface-2)", color: canAdd ? "#1A1500" : "var(--color-text-3)" }}
        >
          <ShoppingCart size={12} />
          {outOfStock ? "Sold out" : isExpired ? "Expired" : "Add"}
        </button>
      </div>

      {/* ── Info area ── */}
      <Link href={`/product/${product.id}`} className="flex-1 flex flex-col">
        <div className="p-3 flex-1 flex flex-col gap-1.5">
          {/* Merchant name */}
          <div className="flex items-center gap-1">
            {product.merchantAvatar && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.merchantAvatar} alt="" className="w-3.5 h-3.5 rounded-full object-cover flex-shrink-0 hidden sm:block" onError={(e) => { e.currentTarget.style.display = "none"; }} />
            )}
            <span className="text-[11px] truncate font-medium" style={{ color: "var(--color-text-3)" }}>
              {product.merchantStoreName}
            </span>
            {product.merchantVerified && (
              <BadgeCheck size={10} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold leading-snug line-clamp-2" style={{ color: "var(--color-text-1)" }}>
            {product.title}
          </h3>

          {/* Price */}
          <div className="mt-auto pt-1">
            <PriceTag price={product.price} compareAt={product.compareAtPrice} size="sm" />
          </div>

          {/* Reviews — desktop only to keep mobile card clean */}
          {product.reviewCount > 0 && (
            <div className="hidden sm:flex items-center gap-1 mt-0.5">
              <Star size={11} style={{ fill: "var(--color-accent)", color: "var(--color-accent)" }} />
              <span className="text-xs font-semibold" style={{ color: "var(--color-accent)" }}>{product.rating.toFixed(1)}</span>
              <span className="text-xs" style={{ color: "var(--color-text-3)" }}>({product.reviewCount})</span>
            </div>
          )}

          {/* Countdown for fresh items */}
          {product.isPerishable && product.expiresAt && !isExpired && (
            <div className="flex items-center justify-between pt-1.5 mt-1"
              style={{ borderTop: "1px solid var(--color-border)" }}>
              <span className="text-[10px]" style={{ color: "var(--color-text-3)" }}>Expires</span>
              <CountdownTimer expiresAt={product.expiresAt} size="sm" />
            </div>
          )}

          {/* Low stock warning */}
          {product.stock > 0 && product.stock <= 3 && (
            <p className="text-[10px] font-semibold" style={{ color: "var(--color-warning)" }}>
              Only {product.stock} left
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
