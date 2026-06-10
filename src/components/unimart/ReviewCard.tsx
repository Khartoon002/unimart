import Image from "next/image";
import { RatingStars } from "./RatingStars";
import { formatRelativeTime, getInitials } from "@/lib/utils";
import type { ReviewWithBuyer } from "@/types";

export function ReviewCard({ review }: { review: ReviewWithBuyer }) {
  const { buyer } = review;
  return (
    <div className="p-4 rounded-2xl" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0"
          style={{ background: "var(--color-surface-2)" }}>
          {buyer.avatar ? (
            <Image src={buyer.avatar} alt={buyer.name ?? ""} fill className="object-cover" />
          ) : (
            <span className="w-full h-full flex items-center justify-center text-xs font-bold" style={{ color: "var(--color-text-2)" }}>
              {getInitials(buyer.name ?? "U")}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{buyer.name}</p>
          <div className="flex items-center gap-2">
            <RatingStars value={review.rating} size={12} />
            <span className="text-xs" style={{ color: "var(--color-text-3)" }}>{formatRelativeTime(review.createdAt)}</span>
          </div>
        </div>
      </div>
      {review.comment && (
        <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-2)" }}>{review.comment}</p>
      )}
    </div>
  );
}
