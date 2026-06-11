"use client";

import { use, useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, CheckCircle2, CreditCard, Landmark, Phone, Loader2 } from "lucide-react";
import { confirmPayment } from "@/server/actions/order.actions";
import { useQuery } from "@tanstack/react-query";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

type Method = "card" | "transfer" | "ussd";

function PaymentContent() {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get("orderId") ?? "";

  const [method, setMethod] = useState<Method>("card");
  const [paid, setPaid] = useState(false);
  const [pending, startTransition] = useTransition();

  const { data: orderData } = useQuery({
    queryKey: ["order-payment", orderId],
    queryFn: async () => {
      const r = await fetch(`/api/orders/${orderId}`);
      if (!r.ok) throw new Error("Order not found");
      return r.json() as Promise<{ id: string; total: number; paystackRef: string | null; items: { id: string }[] }>;
    },
    enabled: !!orderId,
  });

  function handlePay() {
    startTransition(async () => {
      const result = await confirmPayment(orderId);
      if (result.error) { toast.error(result.error); return; }
      setPaid(true);
      setTimeout(() => router.replace("/checkout/success?ref=" + (orderData?.paystackRef ?? orderId)), 1800);
    });
  }

  const METHODS = [
    { id: "card" as const, label: "Card", icon: CreditCard },
    { id: "transfer" as const, label: "Bank Transfer", icon: Landmark },
    { id: "ussd" as const, label: "USSD", icon: Phone },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {paid ? (
            <motion.div key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4 py-12"
            >
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: "var(--color-fresh-soft)" }}>
                  <CheckCircle2 size={44} style={{ color: "var(--color-fresh)" }} />
                </div>
              </motion.div>
              <h2 className="font-display text-2xl font-bold">Payment confirmed!</h2>
              <p className="text-sm" style={{ color: "var(--color-text-2)" }}>Redirecting to your order…</p>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              {/* Header */}
              <div className="text-center space-y-1">
                <p className="text-sm font-medium" style={{ color: "var(--color-text-3)" }}>Total amount</p>
                <p className="font-display text-4xl font-bold" style={{ color: "var(--color-primary)" }}>
                  {orderData ? formatPrice(Number(orderData.total)) : "—"}
                </p>
                <p className="text-xs" style={{ color: "var(--color-text-3)" }}>
                  Order {orderData?.paystackRef ?? orderId.slice(-8).toUpperCase()}
                </p>
              </div>

              {/* Card */}
              <div className="rounded-2xl overflow-hidden" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                {/* Method tabs */}
                <div className="flex" style={{ borderBottom: "1px solid var(--color-border)" }}>
                  {METHODS.map(({ id, label, icon: Icon }) => (
                    <button key={id} onClick={() => setMethod(id)}
                      className="flex-1 flex flex-col items-center gap-1.5 py-3.5 text-xs font-semibold transition-colors"
                      style={{
                        background: method === id ? "var(--color-surface-2)" : "transparent",
                        color: method === id ? "var(--color-primary)" : "var(--color-text-3)",
                        borderBottom: method === id ? "2px solid var(--color-primary)" : "2px solid transparent",
                      }}>
                      <Icon size={16} />
                      {label}
                    </button>
                  ))}
                </div>

                <div className="p-5 space-y-4">
                  {method === "card" && (
                    <>
                      <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-2)" }}>Card number</label>
                        <input
                          readOnly
                          defaultValue="4084 0840 8408 4084"
                          className="w-full h-11 px-4 rounded-xl text-sm font-mono outline-none"
                          style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-2)" }}>Expiry</label>
                          <input readOnly defaultValue="12/28"
                            className="w-full h-11 px-4 rounded-xl text-sm font-mono outline-none"
                            style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-2)" }}>CVV</label>
                          <input readOnly defaultValue="408"
                            className="w-full h-11 px-4 rounded-xl text-sm font-mono outline-none"
                            style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }} />
                        </div>
                      </div>
                    </>
                  )}

                  {method === "transfer" && (
                    <div className="space-y-3 py-2">
                      <p className="text-sm font-medium">Transfer to:</p>
                      {[
                        { label: "Bank", value: "Providus Bank" },
                        { label: "Account number", value: "9100012345" },
                        { label: "Account name", value: "UniMart Escrow" },
                        { label: "Amount", value: orderData ? formatPrice(Number(orderData.total)) : "—" },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between text-sm">
                          <span style={{ color: "var(--color-text-3)" }}>{label}</span>
                          <span className="font-semibold">{value}</span>
                        </div>
                      ))}
                      <p className="text-xs mt-2 p-3 rounded-xl" style={{ background: "var(--color-surface-2)", color: "var(--color-text-2)" }}>
                        Use your order ref as narration. Click Pay after transfer.
                      </p>
                    </div>
                  )}

                  {method === "ussd" && (
                    <div className="space-y-3 py-2 text-center">
                      <p className="text-sm" style={{ color: "var(--color-text-2)" }}>Dial from your registered phone:</p>
                      <p className="font-mono text-2xl font-bold tracking-wide" style={{ color: "var(--color-primary)" }}>
                        *737*2*{orderData ? Math.round(Number(orderData.total)) : "0"}#
                      </p>
                      <p className="text-xs" style={{ color: "var(--color-text-3)" }}>GTBank · Click Pay once done</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Escrow note */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl text-sm"
                style={{ background: "color-mix(in srgb, var(--color-primary) 6%, transparent)", border: "1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)" }}>
                <Shield size={16} style={{ color: "var(--color-primary)", flexShrink: 0, marginTop: 1 }} />
                <p style={{ color: "var(--color-text-2)" }}>
                  Your payment is held in <strong>escrow</strong> until you confirm delivery. You&rsquo;re always protected.
                </p>
              </div>

              <button onClick={handlePay} disabled={pending || !orderData}
                className="w-full h-13 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-opacity disabled:opacity-50"
                style={{ background: "var(--color-primary)", color: "#fff", height: 52 }}>
                {pending ? (
                  <><Loader2 size={20} className="animate-spin" /> Processing…</>
                ) : (
                  `Pay ${orderData ? formatPrice(Number(orderData.total)) : "—"}`
                )}
              </button>

              <p className="text-center text-xs" style={{ color: "var(--color-text-3)" }}>
                This is a demo payment — no real money is charged
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense>
      <PaymentContent />
    </Suspense>
  );
}
