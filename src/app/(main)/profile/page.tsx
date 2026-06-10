import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Star, Package, Heart } from "lucide-react";
import { getInitials, formatDate } from "@/lib/utils";
import { RatingStars } from "@/components/unimart/RatingStars";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      merchantProfile: { select: { storeName: true, isVerified: true, rating: true, totalRatings: true, totalSales: true } },
      _count: { select: { orders: true, savedProducts: true } },
    },
  });

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile card */}
      <div className="p-6 rounded-3xl text-center"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <div className="relative w-24 h-24 rounded-full overflow-hidden mx-auto mb-4"
          style={{ background: "var(--color-surface-2)" }}>
          {user.avatar ? (
            <Image src={user.avatar} alt={user.name ?? ""} fill className="object-cover" />
          ) : (
            <span className="w-full h-full flex items-center justify-center text-2xl font-bold font-display" style={{ color: "var(--color-primary)" }}>
              {getInitials(user.name ?? "U")}
            </span>
          )}
        </div>
        <h1 className="font-display text-2xl font-bold">{user.name}</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-text-3)" }}>{user.email}</p>
        {user.faculty && (
          <p className="text-sm mt-1" style={{ color: "var(--color-text-2)" }}>{user.faculty}</p>
        )}
        <p className="text-xs mt-2" style={{ color: "var(--color-text-3)" }}>Member since {formatDate(user.createdAt)}</p>

        <Link href="/settings">
          <button className="mt-4 h-9 px-5 rounded-full text-sm font-semibold"
            style={{ border: "1px solid var(--color-border)", color: "var(--color-text-1)" }}>
            Edit profile
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { icon: Package, label: "Total orders", value: user._count.orders },
          { icon: Heart, label: "Saved items", value: user._count.savedProducts },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="p-4 rounded-2xl text-center"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <Icon size={20} style={{ color: "var(--color-primary)", margin: "0 auto 8px" }} />
            <p className="font-display text-2xl font-bold">{value}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-3)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Merchant card */}
      {user.merchantProfile && (
        <div className="p-5 rounded-2xl"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-semibold">Merchant profile</h2>
            {user.merchantProfile.isVerified && <BadgeCheck size={16} style={{ color: "var(--color-primary)" }} />}
          </div>
          <p className="font-bold text-lg">{user.merchantProfile.storeName}</p>
          {user.merchantProfile.totalRatings > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <RatingStars value={user.merchantProfile.rating} size={13} />
              <span className="text-sm">{user.merchantProfile.rating.toFixed(1)}</span>
              <span className="text-sm" style={{ color: "var(--color-text-3)" }}>({user.merchantProfile.totalRatings} reviews)</span>
            </div>
          )}
          <p className="text-sm mt-2" style={{ color: "var(--color-text-2)" }}>
            {user.merchantProfile.totalSales.toLocaleString()} total sales
          </p>
          <Link href="/dashboard">
            <button className="mt-3 h-9 px-4 rounded-full text-sm font-semibold"
              style={{ background: "var(--color-primary-soft)", color: "var(--color-primary)" }}>
              Go to dashboard →
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
