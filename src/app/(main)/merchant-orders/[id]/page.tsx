"use client";

import { use, useTransition } from "react";
import { useOrder } from "@/hooks/useOrders";
import { updateOrderStatus } from "@/server/actions/order.actions";
import { OrderTimeline } from "@/components/unimart/OrderTimeline";
import { StatusBadge } from "@/components/unimart/StatusBadge";
import { PriceTag } from "@/components/unimart/PriceTag";
import { formatPrice, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

const NEXT_STATUS: Record<string, { value: string; label: string; color: string }> = {
  CONFIRMED: { value: "PROCESSING", label: "Mark as processing", color: "var(--color-primary)" },
  PROCESSING: { value: "SHIPPED", label: "Mark as shipped", color: "var(--color-warning)" },
};

export default function MerchantOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: order, isLoading, refetch } = useOrder(id);
  const [pending, startTransition] = useTransition();

  if (isLoading) return (
    <div className="max-w-2xl mx-auto space-y-4">
      {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: "var(--color-surface)" }} />)}
    </div>
  );

  if (!order) return <p className="text-center py-20" style={{ color: "var(--color-text-3)" }}>Order not found.</p>;

  const next = NEXT_STATUS[order.status];

  function handleUpdateStatus() {
    if (!next) return;
    startTransition(async () => {
      const result = await updateOrderStatus(order!.id, next.value as "PROCESSING" | "SHIPPED");
      if (result.error) { toast.error(result.error); return; }
      toast.success(`Order marked as ${next.value.toLowerCase()}`);
      refetch();
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/merchant-orders" className="text-sm mb-2 block" style={{ color: "var(--color-text-3)" }}>← Back to orders</Link>
          <h1 className="font-display text-xl font-bold">{order.paystackRef ?? order.id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-text-3)" }}>{formatDate(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Timeline */}
      <div className="p-5 rounded-2xl" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <h2 className="font-semibold mb-4">Order status</h2>
        <OrderTimeline currentStatus={order.status} events={order.timeline as Parameters<typeof OrderTimeline>[0]["events"]} />
        {next && (
          <button onClick={handleUpdateStatus} disabled={pending}
            className="mt-4 h-11 px-6 rounded-2xl font-semibold w-full transition-opacity disabled:opacity-50"
            style={{ background: next.color, color: "#fff" }}>
            {pending ? "Updating…" : next.label}
          </button>
        )}
      </div>

      {/* Buyer info */}
      <div className="p-5 rounded-2xl" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <h2 className="font-semibold mb-3">Buyer</h2>
        <p className="text-sm font-medium">{(order as { buyer?: { name: string | null; email: string } }).buyer?.name ?? "Unknown"}</p>
        <p className="text-sm" style={{ color: "var(--color-text-3)" }}>{(order as { buyer?: { name: string | null; email: string } }).buyer?.email}</p>
        {order.deliveryAddress && (
          <div className="mt-3 p-3 rounded-xl" style={{ background: "var(--color-surface-2)" }}>
            <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-text-3)" }}>DELIVERY ADDRESS</p>
            {(() => {
              const addr = order.deliveryAddress as { hostel?: string; room?: string; faculty?: string; pickupPoint?: string; recipientName?: string };
              return (
                <>
                  {addr.recipientName && <p className="text-sm font-medium">{addr.recipientName}</p>}
                  {addr.hostel && <p className="text-sm">{addr.hostel}{addr.room ? `, Room ${addr.room}` : ""}</p>}
                  {addr.faculty && <p className="text-sm">{addr.faculty}</p>}
                  {addr.pickupPoint && <p className="text-sm text-xs" style={{ color: "var(--color-text-3)" }}>Pickup: {addr.pickupPoint}</p>}
                </>
              );
            })()}
          </div>
        )}
        {(order as { deliveryNote?: string | null }).deliveryNote && (
          <div className="mt-3 p-3 rounded-xl" style={{ background: "var(--color-surface-2)" }}>
            <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-text-3)" }}>NOTE FROM BUYER</p>
            <p className="text-sm">{(order as { deliveryNote?: string | null }).deliveryNote}</p>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="p-5 rounded-2xl space-y-3" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <h2 className="font-semibold">Items</h2>
        {order.items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0" style={{ background: "var(--color-surface-2)" }}>
              {item.product.images[0] && <Image src={item.product.images[0]} alt={item.product.title} fill className="object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-1">{item.product.title}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-3)" }}>Qty: {item.quantity}</p>
            </div>
            <PriceTag price={item.unitPrice * item.quantity} size="sm" />
          </div>
        ))}
        <div className="pt-3 flex justify-between font-bold text-sm" style={{ borderTop: "1px solid var(--color-border)" }}>
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
