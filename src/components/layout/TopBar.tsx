"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Bell, ShoppingCart, User, Settings, LogOut, Repeat } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import { useNotifications, useMarkNotificationsRead } from "@/hooks/useNotifications";
import { getInitials, formatRelativeTime } from "@/lib/utils";
import { updateActiveRole } from "@/server/actions/auth.actions";
import { toast } from "sonner";
import type { UserRole } from "@prisma/client";

export function TopBar() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [switching, startSwitch] = useTransition();
  const cartCount = useCartStore((s) => s.itemCount);
  const openCartDrawer = useUIStore((s) => s.openCartDrawer);
  const { data: notifData } = useNotifications();
  const markRead = useMarkNotificationsRead();
  const notifications = notifData?.notifications?.slice(0, 5) ?? [];
  const unreadCount = notifData?.unreadCount ?? 0;

  const user = session?.user;
  const isMerchant = user?.activeRole === "MERCHANT";
  const hasBothRoles = user?.roles?.length === 2;

  function handleSwitchRole() {
    const newRole: UserRole = isMerchant ? "BUYER" : "MERCHANT";
    startSwitch(async () => {
      const result = await updateActiveRole(newRole);
      if (result.error) { toast.error(result.error); return; }
      await updateSession({ activeRole: newRole });
      toast.success(`Switched to ${newRole === "MERCHANT" ? "Merchant" : "Buyer"} mode`);
      router.push(newRole === "MERCHANT" ? "/dashboard" : "/marketplace");
    });
  }

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-4 h-14 md:h-16 px-4 md:px-6"
      style={{ background: "linear-gradient(180deg, var(--color-bg) 70%, transparent)", backdropFilter: "blur(8px)" }}>
      {/* Brand wordmark (small, shown only on desktop) */}
      <span className="hidden lg:block text-sm font-bold tracking-tight" style={{ color: "var(--color-text-3)" }}>
        UniMart
      </span>
      <div className="flex-1" />

      <div className="flex items-center gap-2">
        {!user ? (
          /* Unauthenticated: show sign-in / sign-up */
          <>
            <Link href="/login">
              <button className="hidden sm:flex h-9 px-4 rounded-full text-sm font-semibold transition-colors items-center"
                style={{ border: "1px solid var(--color-border)", color: "var(--color-text-2)" }}>
                Sign in
              </button>
            </Link>
            <Link href="/signup">
              <button className="h-9 px-4 rounded-full text-sm font-semibold"
                style={{ background: "var(--color-primary)", color: "#fff" }}>
                Sign up
              </button>
            </Link>
          </>
        ) : (
          /* Authenticated: notifications, cart, avatar */
          <>
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setUserOpen(false); if (!notifOpen) markRead.mutate([]); }}
                className="relative w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center"
                    style={{ background: "var(--color-danger)", color: "#fff", border: "2px solid var(--color-bg)" }}>
                    {unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute top-12 right-0 w-80 max-w-[calc(100vw-1rem)] rounded-2xl overflow-hidden animate-slide-down z-50"
                  style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-modal)" }}>
                  <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <span className="font-semibold text-sm">Notifications</span>
                    <Link href="/notifications" onClick={() => setNotifOpen(false)} className="text-xs font-semibold" style={{ color: "var(--color-primary)" }}>View all</Link>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="text-center py-8 text-sm" style={{ color: "var(--color-text-3)" }}>No notifications yet</p>
                  ) : (
                    notifications.map((n: { id: string; title: string; body: string; createdAt: string; isRead: boolean }) => (
                      <div key={n.id} className="flex gap-3 px-4 py-3 transition-colors" style={{ opacity: n.isRead ? 0.6 : 1 }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-2)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">{n.title}</p>
                          <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "var(--color-text-2)" }}>{n.body}</p>
                          <p className="text-xs mt-1" style={{ color: "var(--color-text-3)" }}>{formatRelativeTime(n.createdAt)}</p>
                        </div>
                        {!n.isRead && <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: "var(--color-primary)" }} />}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Cart */}
            <button
              onClick={openCartDrawer}
              className="relative w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text-1)" }}>
              <ShoppingCart size={18} fill={cartCount > 0 ? "currentColor" : "none"} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center"
                  style={{ background: "var(--color-danger)", color: "#fff", border: "2px solid var(--color-bg)" }}>
                  {cartCount}
                </span>
              )}
            </button>

            {/* Avatar / dropdown */}
            <div className="relative">
              <button onClick={() => { setUserOpen(!userOpen); setNotifOpen(false); }}
                className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
                style={{ border: "2px solid var(--color-border)" }}>
                {user.image ? (
                  <Image src={user.image} alt={user.name ?? ""} width={40} height={40} className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold"
                    style={{ background: "var(--color-primary-soft)", color: "var(--color-primary)" }}>
                    {getInitials(user.name ?? "U")}
                  </div>
                )}
              </button>
              {userOpen && (
                <div className="absolute top-12 right-0 w-52 max-w-[calc(100vw-1rem)] rounded-2xl overflow-hidden animate-slide-down z-50"
                  style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-modal)" }}>
                  <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <p className="font-semibold text-sm truncate">{user.name}</p>
                    <p className="text-xs truncate mt-0.5" style={{ color: "var(--color-text-3)" }}>{user.email}</p>
                  </div>
                  {[
                    { href: "/profile", label: "View Profile", icon: User },
                    { href: "/settings", label: "Settings", icon: Settings },
                  ].map(({ href, label, icon: Icon }) => (
                    <Link key={href} href={href} onClick={() => setUserOpen(false)}>
                      <div className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-2)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        <Icon size={15} style={{ color: "var(--color-text-3)" }} />
                        {label}
                      </div>
                    </Link>
                  ))}
                  {hasBothRoles && (
                    <button onClick={() => { handleSwitchRole(); setUserOpen(false); }}
                      disabled={switching}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-2)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <Repeat size={15} style={{ color: "var(--color-primary)" }} />
                      Switch to {isMerchant ? "Buyer" : "Merchant"}
                    </button>
                  )}
                  <div style={{ borderTop: "1px solid var(--color-border)" }}>
                    <button onClick={() => signOut({ callbackUrl: "/login" })}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                      style={{ color: "var(--color-danger)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-2)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <LogOut size={15} /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}