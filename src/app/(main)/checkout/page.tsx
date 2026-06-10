"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { MapPin, Plus } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { PriceTag } from "@/components/unimart/PriceTag";
import { AddressCard } from "@/components/unimart/AddressCard";
import { formatPrice, calculatePlatformFee, calculateTotal } from "@/lib/utils";
import { DELIVERY_FEE } from "@/lib/constants";
import { createOrder } from "@/server/actions/order.actions";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import type { Address } from "@prisma/client";

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  const { data: addresses = [] } = useQuery<Address[]>({
    queryKey: ["addresses"],
    queryFn: async () => {
      const r = await fetch("/api/addresses");
      return r.json();
    },
  });

  // Cart is loaded from localStorage after hydration; calling router.replace during
  // render crashes SSR because router.replace falls back to `location` on the server.
  // Move the redirect to useEffect so it only runs client-side.
  useEffect(() => {
    if (!items.length) router.replace("/cart");
  }, [items.length, router]);

  if (!items.length) return null;

  const fee = calculatePlatformFee(subtotal);
  const total = calculateTotal(subtotal, fee, DELIVERY_FEE);

  // Group items by merchant
  const byMerchant = items.reduce((acc, item) => {
    const key = item.merchantId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  const merchantCount = Object.keys(byMerchant).length;

  function handleCheckout() {
    if (!selectedAddressId) { toast.error("Please select a delivery address"); return; }
    if (merchantCount > 1) { toast.error("You can only order from one merchant per checkout"); return; }

    startTransition(async () => {
      const result = await createOrder({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, variantOptionId: i.variantOptionId })),
        addressId: selectedAddressId,
        deliveryNote: note || undefined,
      });

      if (result.error) { toast.error(result.error); return; }
      if (result.data?.order) {
        clearCart();
        router.push(`/checkout/payment?orderId=${result.data.order.id}`);
      }
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="font-display text-2xl font-bold">Checkout</h1>

      {merchantCount > 1 && (
        <div className="p-4 rounded-2xl" style={{ background: "color-mix(in srgb, var(--color-warning) 10%, transparent)", border: "1px solid var(--color-warning)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--color-warning)" }}>
            ⚠️ Your cart has items from {merchantCount} merchants. Please checkout one merchant at a time.
          </p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Address + note */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="font-semibold mb-4">Delivery address</h2>
            {addresses.length === 0 ? (
              <div className="p-6 rounded-2xl text-center" style={{ border: "2px dashed var(--color-border)" }}>
                <MapPin size={24} style={{ color: "var(--color-text-3)", margin: "0 auto 12px" }} />
                <p className="text-sm" style={{ color: "var(--color-text-2)" }}>No saved addresses yet</p>
                <a href="/settings" className="text-sm font-semibold mt-2 block" style={{ color: "var(--color-primary)" }}>
                  Add an address →
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <AddressCard key={addr.id} address={addr} selected={selectedAddressId === addr.id} onSelect={() => setSelectedAddressId(addr.id)} />
                ))}
                <a href="/settings" className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
                  <Plus size={14} /> Add new address
                </a>
              </div>
            )}
          </div>

          {/* Order note */}
          <div>
            <h2 className="font-semibold mb-2">Order note <span className="font-normal text-sm" style={{ color: "var(--color-text-3)" }}>(optional)</span></h2>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any special instructions for the merchant?"
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
              style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }}
            />
          </div>

          {/* Items */}
          <div>
            <h2 className="font-semibold mb-4">Items ({items.length})</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 rounded-xl"
                  style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0" style={{ background: "var(--color-surface-2)" }}>
                    {item.image && <Image src={item.image} alt={item.title} fill className="object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    {item.variantLabel && <p className="text-xs" style={{ color: "var(--color-text-3)" }}>{item.variantLabel}</p>}
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-2)" }}>Qty: {item.quantity}</p>
                  </div>
                  <PriceTag price={item.price * item.quantity} size="sm" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div>
          <div className="rounded-2xl p-5 sticky top-20 space-y-4"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <h2 className="font-semibold text-lg">Order total</h2>
            <div className="space-y-2.5">
              {[
                { label: "Subtotal", value: formatPrice(subtotal) },
                { label: "Delivery fee", value: formatPrice(DELIVERY_FEE) },
                { label: "Platform fee", value: formatPrice(fee) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span style={{ color: "var(--color-text-2)" }}>{label}</span>
                  <span>{value}</span>
                </div>
              ))}
              <div className="pt-2 flex justify-between font-bold" style={{ borderTop: "1px solid var(--color-border)" }}>
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <div className="pt-2 p-3 rounded-xl text-xs" style={{ background: "var(--color-surface-2)" }}>
              <p className="font-semibold mb-1">🔒 Secure escrow payment</p>
              <p style={{ color: "var(--color-text-3)" }}>Funds are held safely until you confirm delivery.</p>
            </div>

            <button onClick={handleCheckout} disabled={pending || !selectedAddressId || merchantCount > 1}
              className="w-full h-12 rounded-2xl font-semibold transition-opacity disabled:opacity-40"
              style={{ background: "var(--color-primary)", color: "#fff" }}>
              {pending ? "Processing…" : `Pay ${formatPrice(total)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
