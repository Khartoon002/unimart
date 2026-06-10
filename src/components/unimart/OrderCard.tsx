import Image from "next/image";
import Link from "next/link";
import { StatusBadge } from "./StatusBadge";
import { formatPrice, formatRelativeTime } from "@/lib/utils";
import type { OrderWithDetails } from "@/types";

interface OrderCardProps {
  order: OrderWithDetails;
}

export function OrderCard({ order }: OrderCardProps) {
  const firstItem = order.items[0];
  const extraCount = order.items.length - 1;
  const firstImage = firstItem?.product?.images?.[0];

  return (
    <Link href={`/orders/${order.id}`}>
      <div className="flex items-center gap-4 p-4 rounded-2xl transition-colors"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}>
        {/* Product thumbnail */}
        <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0"
          style={{ background: "var(--color-surface-2)" }}>
          {firstImage && <Image src={firstImage} alt={firstItem?.product?.title ?? ""} fill className="object-cover" />}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text-1)" }}>
                {firstItem?.product?.title ?? "Product"}
                {extraCount > 0 && <span style={{ color: "var(--color-text-3)" }}> +{extraCount} more</span>}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-3)" }}>
                {order.paystackRef ?? order.id.slice(-8).toUpperCase()} · {formatRelativeTime(order.createdAt)}
              </p>
            </div>
            <StatusBadge status={order.status} />
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm font-bold" style={{ color: "var(--color-text-1)" }}>{formatPrice(order.total)}</p>
            <p className="text-xs" style={{ color: "var(--color-text-3)" }}>
              {order.items.reduce((s, i) => s + i.quantity, 0)} item{order.items.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
