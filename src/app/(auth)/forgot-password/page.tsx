"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { forgotPassword } from "@/server/actions/auth.actions";
import { Loader2, ShoppingBag, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--color-bg)" }}>
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <ShoppingBag size={28} className="mx-auto mb-2" style={{ color: "var(--color-primary)" }} />
          <span className="font-display text-2xl font-bold" style={{ color: "var(--color-primary)" }}>UniMart</span>
        </div>

        <div className="rounded-2xl p-8" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-modal)" }}>
          {!sent ? (
            <>
              <h1 className="font-display text-2xl font-semibold mb-2">Forgot password?</h1>
              <p className="text-sm mb-6" style={{ color: "var(--color-text-2)" }}>
                Enter your email and we&apos;ll send you a reset code.
              </p>
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: "var(--color-text-2)" }}>Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@university.edu.ng"
                    className="w-full h-11 px-4 rounded-xl text-sm outline-none"
                    style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full h-11 rounded-full font-semibold text-sm flex items-center justify-center gap-2"
                  style={{ background: "var(--color-primary)", color: "#fff", opacity: loading || !email ? 0.6 : 1 }}
                >
                  {loading && <Loader2 size={15} className="animate-spin" />}
                  {loading ? "Sending…" : "Send reset code"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "var(--color-fresh-soft)", color: "var(--color-fresh)" }}>
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="font-display text-xl font-semibold mb-2">Check your inbox</h2>
              <p className="text-sm" style={{ color: "var(--color-text-2)" }}>
                If an account exists for <strong>{email}</strong>, you&apos;ll receive a 6-digit code within a few minutes.
              </p>
            </div>
          )}
        </div>

        <Link href="/login" className="flex items-center justify-center gap-1.5 mt-5 text-sm font-medium" style={{ color: "var(--color-text-2)" }}>
          <ArrowLeft size={15} /> Back to sign in
        </Link>
      </div>
    </div>
  );
}