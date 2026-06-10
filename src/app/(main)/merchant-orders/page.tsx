"use client";

import { useState } from "react";
import { useMerchantOrders } from "@/hooks/useDashboard";
import { StatusBadge } from "@/components/unimart/StatusBadge";
import { EmptyState } from "@/components/unimart/EmptyState";
import { formatPrice, formatRelativeTime } from "@/lib/utils";
import { ClipboardList } from "lucide-react";
import Link from "next/link";

const STATUS_TABS = [
  { value: undefined, label: "All" },
  { value: "CONFIRMED", label: "New" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
] as const;

export default function MerchantOrdersPage() {
  const [status, setStatus] = useState<string | undefined>(undefined);
  const { data, isLoading } = useMerchantOrders(status);
  const orders = data?.orders ?? [];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Orders</h1>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-none">
        {STATUS_TABS.map((tab) => {
          const active = tab.value === status;
          return (
            <button key={String(tab.value)} onClick={() => setStatus(tab.value)}
              className="flex-shrink-0 h-8 px-4 rounded-full text-sm font-medium transition-colors"
              style={{
                background: active ? "var(--color-primary)" : "var(--color-surface)",
                border: `1px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`,
                color: active ? "#fff" : "var(--color-text-2)",
              }}>
              {tab.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: "var(--color-surface)" }} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No orders yet" description="Orders from buyers will appear here." />
      ) : (
        <div className="space-y-3">
          {(orders as Array<{ id: string; paystackRef: string | null; total: number; status: string; createdAt: string | Date; buyer: { name: string | null } | null; items: { id: string }[] }>).map((order) => (
            <Link key={order.id} href={`/merchant-orders/${order.id}`}>
              <div className="flex items-center justify-between p-4 rounded-2xl transition-colors"
                style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}>
                <div>
                  <p className="font-semibold text-sm">{order.paystackRef ?? order.id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-text-3)" }}>
                    {order.buyer?.name ?? "Buyer"} · {order.items.length} item{order.items.length !== 1 ? "s" : ""} · {formatRelativeTime(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm">{formatPrice(order.total)}</span>
                  <StatusBadge status={order.status as Parameters<typeof StatusBadge>[0]["status"]} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
