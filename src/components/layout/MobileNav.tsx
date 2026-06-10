"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Leaf, ShoppingCart, Package, User } from "lucide-react";
import { motion } from "framer-motion";
import { useCartStore } from "@/stores/cartStore";

const TABS = [
  { href: "/marketplace", label: "Home", icon: Home },
  { href: "/fresh", label: "Fresh", icon: Leaf },
  { href: "/cart", label: "Cart", icon: ShoppingCart, badge: true },
  { href: "/orders", label: "Orders", icon: Package },
  { href: "/profile", label: "Profile", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();
  const cartCount = useCartStore((s) => s.itemCount);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{ background: "var(--color-surface)", borderTop: "1px solid var(--color-border)", paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}>
      <div className="flex justify-around px-2 pt-2">
        {TABS.map((tab) => {
          const active = pathname === tab.href || (tab.href !== "/marketplace" && pathname.startsWith(tab.href));
          return (
            <Link key={tab.href} href={tab.href}>
              <div className="relative flex flex-col items-center gap-0.5 px-3 py-1">
                {active && (
                  <motion.span layoutId="mobile-tab-dot"
                    className="absolute -top-1.5 w-1 h-1 rounded-full"
                    style={{ background: "var(--color-primary)" }}
                  />
                )}
                <div className="relative">
                  <tab.icon size={22} style={{ color: active ? "var(--color-primary)" : "var(--color-text-3)" }} />
                  {tab.badge && cartCount > 0 && (
                    <span className="absolute -top-1 -right-2 min-w-[14px] h-3.5 px-0.5 rounded-full text-[9px] font-bold flex items-center justify-center"
                      style={{ background: "var(--color-danger)", color: "#fff" }}>
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium" style={{ color: active ? "var(--color-primary)" : "var(--color-text-3)" }}>
                  {tab.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}