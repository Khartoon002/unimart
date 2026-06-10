import Link from "next/link";
import { Bell, Package, MessageCircle, Star, Wallet, ShoppingBag } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import type { NotifType } from "@prisma/client";

const ICONS: Partial<Record<NotifType, typeof Bell>> = {
  NEW_ORDER: Package,
  ORDER_SHIPPED: Package,
  ORDER_CONFIRMED: Package,
  ORDER_DELIVERED: Package,
  PAYMENT_RECEIVED: Wallet,
  NEW_REVIEW: Star,
  LISTING_EXPIRING: ShoppingBag,
  ANNOUNCEMENT: Bell,
};

interface NotifData {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string | Date;
}

export function NotificationItem({ notif }: { notif: NotifData }) {
  const Icon = ICONS[notif.type] ?? Bell;
  const inner = (
    <div className={`flex items-start gap-3 px-4 py-3.5 transition-colors ${!notif.isRead ? "opacity-100" : "opacity-70"}`}
      style={{ background: notif.isRead ? "transparent" : "color-mix(in srgb, var(--color-primary) 6%, transparent)" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-2)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = notif.isRead ? "transparent" : "color-mix(in srgb, var(--color-primary) 6%, transparent)")}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "var(--color-surface-2)" }}>
        <Icon size={16} style={{ color: "var(--color-primary)" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{notif.title}</p>
        <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "var(--color-text-2)" }}>{notif.body}</p>
        <p className="text-xs mt-1" style={{ color: "var(--color-text-3)" }}>{formatRelativeTime(notif.createdAt)}</p>
      </div>
      {!notif.isRead && (
        <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: "var(--color-primary)" }} />
      )}
    </div>
  );

  if (notif.link) return <Link href={notif.link}>{inner}</Link>;
  return inner;
}
