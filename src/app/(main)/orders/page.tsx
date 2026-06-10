"use client";

import { useState } from "react";
import { Package } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { OrderCard } from "@/components/unimart/OrderCard";
import { EmptyState } from "@/components/unimart/EmptyState";
import type { OrderWithDetails } from "@/types";

const STATUS_TABS = [
  { value: undefined, label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
] as const;

export default function OrdersPage() {
  const [status, setStatus] = useState<string | undefined>(undefined);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading } = useOrders(status as any);
  const orders = data?.orders ?? [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-display text-2xl font-bold">My Orders</h1>

      {/* Tab bar */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-none">
        {STATUS_TABS.map((tab) => {
          const active = tab.value === status;
          return (
            <button key={String(tab.value)}
              onClick={() => setStatus(tab.value)}
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

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: "var(--color-surface)" }} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState icon={Package} title="No orders yet" description="Your orders will appear here once you place one." action={{ label: "Start shopping", href: "/marketplace" }} />
      ) : (
        <div className="space-y-3">
          {(orders as OrderWithDetails[]).map((order) => <OrderCard key={order.id} order={order} />)}
        </div>
      )}
    </div>
  );
}
