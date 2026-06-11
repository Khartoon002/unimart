"use client";

import { useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

function SuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const ref = params.get("ref") ?? params.get("reference");
  const redirected = useRef(false);

  useEffect(() => {
    if (!ref && !redirected.current) {
      redirected.current = true;
      router.replace("/orders");
    }
  }, [ref, router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto"
          style={{ background: "var(--color-fresh-soft)" }}>
          <CheckCircle2 size={44} style={{ color: "var(--color-fresh)" }} />
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-3">
        <h1 className="font-display text-3xl font-bold">Payment successful!</h1>
        <p className="text-sm max-w-sm mx-auto" style={{ color: "var(--color-text-2)" }}>
          Your order has been placed. The merchant will process it shortly. You&rsquo;ll get a notification when it ships.
        </p>
        {ref && (
          <p className="text-xs font-mono" style={{ color: "var(--color-text-3)" }}>Ref: {ref}</p>
        )}
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex gap-3 mt-8">
        <Link href="/orders">
          <button className="h-11 px-6 rounded-2xl font-semibold"
            style={{ background: "var(--color-primary)", color: "#fff" }}>
            View my orders
          </button>
        </Link>
        <Link href="/marketplace">
          <button className="h-11 px-6 rounded-2xl font-semibold"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            Keep shopping
          </button>
        </Link>
      </motion.div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
