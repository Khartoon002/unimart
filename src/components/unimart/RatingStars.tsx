"use client";

import { Star } from "lucide-react";

interface RatingStarsProps {
  value: number;
  max?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (v: number) => void;
}

export function RatingStars({ value, max = 5, size = 14, interactive, onChange }: RatingStarsProps) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const filled = i + 1 <= Math.round(value);
        return (
          <Star
            key={i}
            size={size}
            onClick={interactive ? () => onChange?.(i + 1) : undefined}
            style={{
              cursor: interactive ? "pointer" : "default",
              color: filled ? "var(--color-accent)" : "var(--color-text-3)",
              fill: filled ? "var(--color-accent)" : "none",
              transition: "color 140ms, fill 140ms",
            }}
          />
        );
      })}
    </span>
  );
}