"use client";

import { useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import {
  Home, Leaf, ShoppingCart, Package, MessageCircle, Heart, User, Settings,
  LayoutDashboard, List, Plus, Wallet, BarChart2, ClipboardList,
  LogOut, Repeat, ChevronLeft, ChevronRight, Store, LogIn,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/stores/cartStore";
import { useNotifications } from "@/hooks/useNotifications";
import { getInitials } from "@/lib/utils";
import { useUIStore } from "@/stores/uiStore";
import { cn } from "@/lib/utils";
import { updateActiveRole } from "@/server/actions/auth.actions";

const BUYER_NAV = [
  { href: "/marketplace", label: "Marketplace", icon: Home },
  { href: "/fresh", label: "Fresh Market", icon: Leaf, fresh: true },
  { href: "/cart", label: "Cart", icon: ShoppingCart, badge: "cart" as const },
  { href: "/orders", label: "My Orders", icon: Package },
  { href: "/messages", label: "Messages", icon: MessageCircle, badge: "messages" as const },
  { href: "/saved", label: "Saved", icon: Heart },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

const MERCHANT_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/listings", label: "My Listings", icon: List },
  { href: "/listings/new", label: "Add Product", icon: Plus, accent: true },
  { href: "/earnings", label: "Earnings", icon: Wallet },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/merchant-orders", label: "Orders", icon: ClipboardList },
  { href: "/messages", label: "Messages", icon: MessageCircle, badge: "messages" as const },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const cartCount = useCartStore((s) => s.itemCount);
  const { data: notifData } = useNotifications();
  const unreadMessages = 0;
  const [rolePending, startRoleTransition] = useTransition();

  const activeRole = session?.user?.activeRole ?? "BUYER";
  const isMerchant = activeRole === "MERCHANT";
  const navItems = isMerchant ? MERCHANT_NAV : BUYER_NAV;

  function handleSwitchRole() {
    const newRole = isMerchant ? "BUYER" : "MERCHANT";
    startRoleTransition(async () => {
      const result = await updateActiveRole(newRole as "BUYER" | "MERCHANT");
      if (!result.error) {
        await updateSession({ activeRole: newRole });
        router.push(newRole === "MERCHANT" ? "/dashboard" : "/marketplace");
      }
    });
  }

  const user = session?.user;
  const unreadNotifs = notifData?.unreadCount ?? 0;

  function getBadge(badge?: "cart" | "messages") {
    if (badge === "cart") return cartCount;
    if (badge === "messages") return unreadMessages;
    return 0;
  }

  return (
    <aside
      className="fixed top-0 left-0 bottom-0 z-50 flex flex-col transition-all duration-300"
      style={{
        width: collapsed ? 64 : 240,
        background: "var(--color-surface)",
        borderRight: "1px solid var(--color-border)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 p-4 h-16 flex-shrink-0 overflow-hidden">
        <Store size={22} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="flex items-center gap-2 overflow-hidden">
              <span className="font-display font-bold text-xl whitespace-nowrap" style={{ color: "var(--color-primary)" }}>UniMart</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                style={{ background: isMerchant ? "var(--color-accent-soft)" : "var(--color-primary-soft)", color: isMerchant ? "var(--color-accent)" : "var(--color-primary)" }}>
                {isMerchant ? "Merchant" : "Buyer"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-1 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/marketplace" && item.href !== "/dashboard" && pathname.startsWith(item.href));
          const badge = getBadge((item as { badge?: "cart" | "messages" }).badge);
          const activeColor = (item as { fresh?: boolean }).fresh ? "var(--color-fresh)" : (item as { accent?: boolean }).accent ? "var(--color-accent)" : "var(--color-primary)";

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ backgroundColor: "var(--color-surface-2)" }}
                className={cn("relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium",
                  active ? "bg-surface-2" : "")}
                style={{ color: active ? activeColor : "var(--color-text-2)" }}
              >
                {active && (
                  <motion.span layoutId="sidebar-indicator"
                    className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
                    style={{ background: activeColor }}
                  />
                )}
                <item.icon size={18} style={{ flexShrink: 0, color: active ? activeColor : undefined }} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex-1 truncate whitespace-nowrap">
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {badge > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: "var(--color-primary)", color: "#fff", flexShrink: 0 }}>
                    {badge}
                  </span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom: role switch + user */}
      <div className="p-2 flex-shrink-0" style={{ borderTop: "1px solid var(--color-border)" }}>
        {/* Role switcher — only for users with both roles */}
        {session?.user?.roles && session.user.roles.length > 1 && !collapsed && (
          <button
            onClick={handleSwitchRole}
            disabled={rolePending}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl mb-1 text-sm font-semibold transition-opacity disabled:opacity-50"
            style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }}
          >
            <Repeat size={15} style={{ color: "var(--color-primary)" }} />
            Switch to {isMerchant ? "Buyer" : "Merchant"}
          </button>
        )}

        {/* User card or Sign in */}
        {user ? (
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0" style={{ background: "var(--color-surface-2)" }}>
              {user.image ? (
                <Image src={user.image} alt={user.name ?? ""} fill className="object-cover" />
              ) : (
                <span className="w-full h-full flex items-center justify-center text-xs font-bold" style={{ color: "var(--color-text-2)" }}>
                  {getInitials(user.name ?? "U")}
                </span>
              )}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{user.name}</p>
                  <p className="text-xs truncate" style={{ color: "var(--color-text-3)" }}>{user.email}</p>
                </motion.div>
              )}
            </AnimatePresence>
            {!collapsed && (
              <button onClick={() => signOut({ callbackUrl: "/login" })} className="flex-shrink-0" style={{ color: "var(--color-text-3)" }}>
                <LogOut size={15} />
              </button>
            )}
          </div>
        ) : collapsed ? (
          <Link href="/login" className="flex items-center justify-center w-10 h-10 mx-auto rounded-xl"
            style={{ background: "var(--color-primary-soft)", color: "var(--color-primary)" }}>
            <LogIn size={18} />
          </Link>
        ) : (
          <Link href="/login">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: "var(--color-primary)", color: "#fff" }}>
              <LogIn size={15} />
              Sign in to your account
            </div>
          </Link>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center z-10"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text-2)" }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}