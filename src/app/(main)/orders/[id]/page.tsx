"use client";

import { use, useTransition } from "react";
import { useOrder } from "@/hooks/useOrders";
import { OrderTimeline } from "@/components/unimart/OrderTimeline";
import { StatusBadge } from "@/components/unimart/StatusBadge";
import { PriceTag } from "@/components/unimart/PriceTag";
import { MerchantBadge } from "@/components/unimart/MerchantBadge";
import { confirmDelivery, cancelOrder } from "@/server/actions/order.actions";
import { formatPrice, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { DELIVERY_FEE } from "@/lib/constants";

type OrderMerchant = { storeName: string; isVerified: boolean; rating: number; user: { id: string; name: string | null; avatar: string | null } };

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: order, isLoading, refetch } = useOrder(id);
  const [pending, startTransition] = useTransition();

  if (isLoading) return (
    <div className="max-w-2xl mx-auto space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: "var(--color-surface)" }} />
      ))}
    </div>
  );

  if (!order) return <p className="text-center py-20" style={{ color: "var(--color-text-3)" }}>Order not found.</p>;

  function handleConfirm() {
    startTransition(async () => {
      const result = await confirmDelivery(order!.id);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Delivery confirmed! Thanks for your order.");
      refetch();
    });
  }

  function handleCancel() {
    startTransition(async () => {
      const result = await cancelOrder(order!.id);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Order cancelled.");
      refetch();
    });
  }

  const canConfirm = order.status === "SHIPPED";
  const canCancel = ["PENDING", "CONFIRMED"].includes(order.status);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/orders" className="text-sm mb-2 block" style={{ color: "var(--color-text-3)" }}>← Back to orders</Link>
          <h1 className="font-display text-xl font-bold">{order.paystackRef ?? order.id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-text-3)" }}>{formatDate(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Timeline */}
      <div className="p-5 rounded-2xl" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <h2 className="font-semibold mb-4">Tracking</h2>
        <OrderTimeline currentStatus={order.status} events={order.timeline as Parameters<typeof OrderTimeline>[0]["events"]} />
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
              <Link href={`/product/${item.productId}`}>
                <p className="text-sm font-medium line-clamp-1">{item.product.title}</p>
              </Link>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-3)" }}>Qty: {item.quantity}</p>
            </div>
            <PriceTag price={item.unitPrice * item.quantity} size="sm" />
          </div>
        ))}
      </div>

      {/* Merchant */}
      <div className="p-5 rounded-2xl" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <h2 className="font-semibold mb-3">Merchant</h2>
        <MerchantBadge
          merchant={{
            id: order.merchantId,
            storeName: (order as { merchant?: OrderMerchant })?.merchant?.storeName ?? "",
            isVerified: (order as { merchant?: OrderMerchant })?.merchant?.isVerified ?? false,
            rating: (order as { merchant?: OrderMerchant })?.merchant?.rating ?? 0,
            user: { avatar: (order as { merchant?: OrderMerchant })?.merchant?.user?.avatar ?? null, name: (order as { merchant?: OrderMerchant })?.merchant?.user?.name ?? "" },
          }}
          asLink
        />
      </div>

      {/* Price summary */}
      <div className="p-5 rounded-2xl space-y-2" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <h2 className="font-semibold mb-3">Payment</h2>
        {[
          { label: "Subtotal", value: formatPrice(order.total - order.platformFee - DELIVERY_FEE) },
          { label: "Delivery fee", value: formatPrice(DELIVERY_FEE) },
          { label: "Platform fee", value: formatPrice(order.platformFee) },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between text-sm">
            <span style={{ color: "var(--color-text-2)" }}>{label}</span>
            <span>{value}</span>
          </div>
        ))}
        <div className="pt-2 flex justify-between font-bold" style={{ borderTop: "1px solid var(--color-border)" }}>
          <span>Total paid</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      {/* Actions */}
      {(canConfirm || canCancel) && (
        <div className="flex gap-3">
          {canConfirm && (
            <button onClick={handleConfirm} disabled={pending}
              className="flex-1 h-12 rounded-2xl font-semibold transition-opacity disabled:opacity-50"
              style={{ background: "var(--color-success)", color: "#fff" }}>
              Confirm delivery
            </button>
          )}
          {canCancel && (
            <button onClick={handleCancel} disabled={pending}
              className="flex-1 h-12 rounded-2xl font-semibold transition-opacity disabled:opacity-50"
              style={{ border: "1px solid var(--color-danger)", color: "var(--color-danger)" }}>
              Cancel order
            </button>
          )}
        </div>
      )}
    </div>
  );
}
