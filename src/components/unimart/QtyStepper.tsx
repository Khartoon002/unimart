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
  const isSm = size === "sm";
  const btnSize = isSm ? "w-7 h-7" : "w-9 h-9";
  const numSize = isSm ? "min-w-[28px] text-xs" : "min-w-[36px] text-sm";
  const iconSize = isSm ? 12 : 14;
  const wrapH = isSm ? "h-7" : "h-9";

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full px-1 ${wrapH}`}
      style={{
        background: "var(--color-surface-2)",
        border: "1px solid var(--color-border)",
      }}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={`${btnSize} rounded-full flex items-center justify-center transition-all disabled:opacity-30 flex-shrink-0`}
        style={{
          background: value <= min ? "transparent" : "var(--color-surface)",
          color: "var(--color-text-1)",
          border: value <= min ? "none" : "1px solid var(--color-border)",
        }}
      >
        <Minus size={iconSize} strokeWidth={2.5} />
      </button>

      <span
        className={`${numSize} flex items-center justify-center font-bold select-none tabular-nums`}
        style={{ color: "var(--color-primary)" }}
      >
        {value}
      </span>

      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={`${btnSize} rounded-full flex items-center justify-center transition-all disabled:opacity-30 flex-shrink-0`}
        style={{
          background: value >= max ? "transparent" : "var(--color-primary)",
          color: value >= max ? "var(--color-text-3)" : "#fff",
          border: "none",
        }}
      >
        <Plus size={iconSize} strokeWidth={2.5} />
      </button>
    </div>
  );
}
