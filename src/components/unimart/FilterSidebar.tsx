"use client";

import { useState } from "react";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { X } from "lucide-react";

interface Filters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isPerishable?: boolean;
}

interface FilterSidebarProps {
  filters: Filters;
  onChange: (f: Filters) => void;
  onClose?: () => void;
}

export function FilterSidebar({ filters, onChange, onClose }: FilterSidebarProps) {
  const [localMin, setLocalMin] = useState(filters.minPrice?.toString() ?? "");
  const [localMax, setLocalMax] = useState(filters.maxPrice?.toString() ?? "");

  function applyPrice() {
    onChange({
      ...filters,
      minPrice: localMin ? Number(localMin) : undefined,
      maxPrice: localMax ? Number(localMax) : undefined,
    });
  }

  return (
    <div className="w-64 flex-shrink-0">
      <div className="rounded-2xl p-5 space-y-6 sticky top-20"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Filters</h3>
          {onClose && <button onClick={onClose}><X size={16} style={{ color: "var(--color-text-3)" }} /></button>}
        </div>

        {/* Category */}
        <div>
          <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "var(--color-text-3)" }}>Category</p>
          <div className="space-y-1">
            {[{ value: "", label: "All" }, ...PRODUCT_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))].map((cat) => {
              const active = cat.value === "" ? !filters.category : filters.category === cat.value;
              return (
                <button key={cat.value || "all"}
                  onClick={() => onChange({ ...filters, category: cat.value || undefined })}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors"
                  style={{
                    background: active ? "var(--color-primary-soft)" : "transparent",
                    color: active ? "var(--color-primary)" : "var(--color-text-2)",
                    fontWeight: active ? 600 : 400,
                  }}>
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price range */}
        <div>
          <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "var(--color-text-3)" }}>Price (₦)</p>
          <div className="flex gap-2 items-center">
            <input type="number" placeholder="Min" value={localMin} onChange={(e) => setLocalMin(e.target.value)}
              className="w-full h-9 px-3 rounded-xl text-sm outline-none"
              style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }} />
            <span style={{ color: "var(--color-text-3)" }}>–</span>
            <input type="number" placeholder="Max" value={localMax} onChange={(e) => setLocalMax(e.target.value)}
              className="w-full h-9 px-3 rounded-xl text-sm outline-none"
              style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }} />
          </div>
          <button onClick={applyPrice}
            className="w-full mt-2 h-8 rounded-xl text-xs font-semibold"
            style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }}>
            Apply
          </button>
        </div>

        {/* Toggles */}
        <div className="space-y-2">
          {[
            { key: "inStock" as const, label: "In stock only" },
            { key: "isPerishable" as const, label: "Fresh Market only" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => onChange({ ...filters, [key]: !filters[key] })}
                className="w-9 h-5 rounded-full transition-colors flex items-center px-0.5 cursor-pointer"
                style={{ background: filters[key] ? "var(--color-primary)" : "var(--color-surface-2)", border: "1px solid var(--color-border)" }}>
                <div className="w-3.5 h-3.5 rounded-full transition-transform bg-white"
                  style={{ transform: filters[key] ? "translateX(16px)" : "translateX(0)" }} />
              </div>
              <span className="text-sm" style={{ color: "var(--color-text-2)" }}>{label}</span>
            </label>
          ))}
        </div>

        {/* Clear */}
        {Object.values(filters).some(Boolean) && (
          <button onClick={() => onChange({})}
            className="w-full h-8 rounded-xl text-xs font-semibold"
            style={{ color: "var(--color-danger)", border: "1px solid var(--color-danger)" }}>
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
}
