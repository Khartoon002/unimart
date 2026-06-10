"use client";

import { Minus, Plus } from "lucide-react";

interface QtyStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
  size?: "sm" | "md";
}

export function QtyStepper({ value, min = 1, max = 99, onChange, size = "md" }: QtyStepperProps) {
  const h = size === "sm" ? "h-7" : "h-9";
  const btnW = size === "sm" ? "w-7" : "w-9";
  const numW = size === "sm" ? "w-7 text-xs" : "w-10 text-sm";

  return (
    <div className={`inline-flex items-center rounded-xl overflow-hidden ${h}`}
      style={{ border: "1px solid var(--color-border)", background: "var(--color-surface-2)" }}>
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={`${btnW} ${h} flex items-center justify-center transition-colors disabled:opacity-30`}
        style={{ color: "var(--color-text-2)" }}
      >
        <Minus size={size === "sm" ? 12 : 14} />
      </button>
      <span className={`${numW} ${h} flex items-center justify-center font-semibold select-none`}
        style={{ color: "var(--color-text-1)" }}>
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={`${btnW} ${h} flex items-center justify-center transition-colors disabled:opacity-30`}
        style={{ color: "var(--color-text-2)" }}
      >
        <Plus size={size === "sm" ? 12 : 14} />
      </button>
    </div>
  );
}