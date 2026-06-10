"use client";

import Link from "next/link";
import { ShoppingBag, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "var(--color-bg)" }}
    >
      <div className="text-center max-w-md w-full">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <ShoppingBag size={28} style={{ color: "var(--color-primary)" }} />
          <span
            className="text-2xl font-bold"
            style={{ color: "var(--color-primary)" }}
          >
            UniMart
          </span>
        </div>

        {/* 404 Graphic */}
        <div className="relative mb-8">
          <p
            className="text-[120px] font-black leading-none select-none"
            style={{
              background:
                "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            404
          </p>
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ pointerEvents: "none" }}
          >
            <div
              className="w-32 h-32 rounded-full blur-3xl opacity-20"
              style={{ background: "var(--color-primary)" }}
            />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-3">Page not found</h1>
        <p className="text-sm mb-8" style={{ color: "var(--color-text-2)" }}>
          This page doesn&apos;t exist or was moved. Let&apos;s get you back to
          the marketplace.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/marketplace">
            <button
              className="flex items-center justify-center gap-2 h-11 px-6 rounded-full font-semibold text-sm w-full sm:w-auto"
              style={{ background: "var(--color-primary)", color: "#fff" }}
            >
              <Search size={16} />
              Browse marketplace
            </button>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 h-11 px-6 rounded-full font-semibold text-sm"
            style={{
              border: "1px solid var(--color-border)",
              color: "var(--color-text-1)",
            }}
          >
            <ArrowLeft size={16} />
            Go back
          </button>
        </div>

        {/* Quick links */}
        <div className="mt-10 pt-8" style={{ borderTop: "1px solid var(--color-border)" }}>
          <p className="text-xs mb-3" style={{ color: "var(--color-text-3)" }}>
            Quick links
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { href: "/", label: "Home" },
              { href: "/marketplace", label: "Marketplace" },
              { href: "/cart", label: "Cart" },
              { href: "/login", label: "Sign in" },
            ].map(({ href, label }) => (
              <Link key={href} href={href}>
                <span
                  className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-2)",
                  }}
                >
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
