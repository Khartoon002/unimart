"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductImageGalleryProps {
  images: string[];
  title: string;
}

export function ProductImageGallery({ images, title }: ProductImageGalleryProps) {
  const [active, setActive] = useState(0);

  if (!images.length) return (
    <div className="aspect-square rounded-2xl" style={{ background: "var(--color-surface-2)" }} />
  );

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative overflow-hidden rounded-2xl" style={{ aspectRatio: "1/1", background: "var(--color-surface-2)" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 w-full h-full"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[active]}
              alt={title}
              className="w-full h-full object-contain"
              onError={(e) => { e.currentTarget.style.opacity = "0.3"; }}
            />
          </motion.div>
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button
              onClick={() => setActive((p) => (p - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "rgba(12,12,15,0.6)", backdropFilter: "blur(4px)", color: "#fff" }}>
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setActive((p) => (p + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "rgba(12,12,15,0.6)", backdropFilter: "blur(4px)", color: "#fff" }}>
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {images.map((src, i) => (
            <button key={i} onClick={() => setActive(i)}
              className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden transition-all"
              style={{
                border: `2px solid ${i === active ? "var(--color-primary)" : "var(--color-border)"}`,
                background: "var(--color-surface-2)",
              }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.opacity = "0.3"; }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
