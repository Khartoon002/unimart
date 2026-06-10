import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Star } from "lucide-react";
import { getInitials } from "@/lib/utils";

interface MerchantBadgeProps {
  merchant: {
    id: string;
    storeName: string;
    isVerified: boolean;
    rating: number;
    user: { avatar?: string | null; name: string };
  };
  size?: "sm" | "base" | "lg";
  showRating?: boolean;
  asLink?: boolean;
}

const avatarSizes = { sm: 20, base: 24, lg: 32 };
const textSizes = { sm: "text-xs", base: "text-xs", lg: "text-sm" };

export function MerchantBadge({ merchant, size = "base", showRating = true, asLink = false }: MerchantBadgeProps) {
  const dim = avatarSizes[size];

  const content = (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full transition-colors ${asLink ? "hover:bg-white/5 cursor-pointer" : ""}`}
    >
      <span className="relative flex-shrink-0 rounded-full overflow-hidden" style={{ width: dim, height: dim, background: "var(--color-surface-2)" }}>
        {merchant.user.avatar ? (
          <Image src={merchant.user.avatar} alt={merchant.storeName} fill className="object-cover" />
        ) : (
          <span className="flex items-center justify-center w-full h-full text-xs font-bold" style={{ color: "var(--color-text-2)" }}>
            {getInitials(merchant.storeName)}
          </span>
        )}
      </span>
      <span className={`font-medium truncate max-w-[120px] ${textSizes[size]}`} style={{ color: "var(--color-text-1)" }}>
        {merchant.storeName}
      </span>
      {merchant.isVerified && (
        <BadgeCheck size={size === "lg" ? 16 : 13} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
      )}
      {showRating && merchant.rating > 0 && (
        <span className={`inline-flex items-center gap-0.5 font-semibold flex-shrink-0 ${textSizes[size]}`} style={{ color: "var(--color-accent)" }}>
          <Star size={10} style={{ fill: "var(--color-accent)", color: "var(--color-accent)" }} />
          {merchant.rating.toFixed(1)}
        </span>
      )}
    </span>
  );

  if (asLink) {
    return <Link href={`/store/${merchant.id}`}>{content}</Link>;
  }

  return content;
}