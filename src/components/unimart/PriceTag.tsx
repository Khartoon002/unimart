import { formatPrice } from "@/lib/utils";

type PriceInput = number | string | { toNumber(): number };

function toNum(v: PriceInput): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseFloat(v);
  return v.toNumber();
}

interface PriceTagProps {
  price: PriceInput;
  compareAt?: PriceInput | null;
  size?: "sm" | "base" | "lg" | "hero";
  color?: string;
  className?: string;
}

const sizes = { sm: "text-sm", base: "text-base", lg: "text-xl", hero: "text-3xl" };
const compareSizes = { sm: "text-xs", base: "text-xs", lg: "text-sm", hero: "text-base" };

export function PriceTag({ price, compareAt, size = "base", color, className }: PriceTagProps) {
  const numPrice = toNum(price);
  const numCompare = compareAt == null ? null : toNum(compareAt);
  const discountPct = numCompare ? Math.round((1 - numPrice / numCompare) * 100) : null;

  return (
    <span className={`inline-flex items-baseline gap-2 font-price${className ? ` ${className}` : ""}`}>
      <span className={`font-bold ${sizes[size]}`} style={{ color: color ?? "var(--color-accent)" }}>
        {formatPrice(numPrice)}
      </span>
      {numCompare && (
        <>
          <span className={`line-through ${compareSizes[size]}`} style={{ color: "var(--color-text-3)" }}>
            {formatPrice(numCompare)}
          </span>
          {discountPct && (
            <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background: "var(--color-danger-soft)", color: "var(--color-danger)" }}>
              -{discountPct}%
            </span>
          )}
        </>
      )}
    </span>
  );
}