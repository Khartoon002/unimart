import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format } from "date-fns";
import { customAlphabet } from "nanoid";
import type { MeilisearchProduct } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number | string | { toNumber(): number }): string {
  const num = typeof amount === "number" ? amount : typeof amount === "string" ? parseFloat(amount) : amount.toNumber();
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "d MMM yyyy");
}

export function formatRelativeTime(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function calculatePlatformFee(subtotal: number): number {
  const pct = parseFloat(process.env.PLATFORM_FEE_PERCENT ?? "2.5");
  return Math.round(subtotal * (pct / 100));
}

export function calculateTotal(subtotal: number, fee: number, delivery: number): number {
  return subtotal + fee + delivery;
}

const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 8);

export function generateOrderRef(): string {
  return "UM-" + nanoid();
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

export function absoluteUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}${path}`;
}

/**
 * Converts a Prisma Product (Decimal fields) to a plain MeilisearchProduct
 * safe for RSC→Client serialization. Next.js 16 validates the entire render
 * tree, including Server→Server props.
 */
export function toPlainProduct(p: {
  id: string; title: string; description?: string | null;
  price: { toNumber(): number } | number | string;
  compareAtPrice?: { toNumber(): number } | number | string | null;
  images: string[]; category: string; stock: number;
  isPerishable: boolean; expiresAt?: Date | string | null;
  merchantId: string; rating: number; reviewCount: number;
  tags: string[]; status: string; createdAt: Date | string; viewCount: number;
  merchant?: { storeName: string; isVerified: boolean; user?: { avatar?: string | null } | null };
}, merchantFallback?: { storeName: string; isVerified: boolean; avatar?: string } ): MeilisearchProduct {
  const toN = (v: { toNumber(): number } | number | string | null | undefined) =>
    v == null ? 0 : typeof v === "number" ? v : typeof v === "string" ? parseFloat(v) : v.toNumber();
  return {
    id: p.id,
    title: p.title,
    description: p.description ?? "",
    price: toN(p.price),
    compareAtPrice: p.compareAtPrice != null ? toN(p.compareAtPrice) : undefined,
    images: p.images,
    category: p.category as MeilisearchProduct["category"],
    stock: p.stock,
    isPerishable: p.isPerishable,
    expiresAt: p.expiresAt ? new Date(p.expiresAt).toISOString() : undefined,
    merchantId: p.merchantId,
    merchantStoreName: p.merchant?.storeName ?? merchantFallback?.storeName ?? "",
    merchantAvatar: p.merchant?.user?.avatar ?? merchantFallback?.avatar ?? undefined,
    merchantVerified: p.merchant?.isVerified ?? merchantFallback?.isVerified ?? false,
    rating: p.rating,
    reviewCount: p.reviewCount,
    tags: p.tags,
    status: p.status as MeilisearchProduct["status"],
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
    viewCount: p.viewCount,
  };
}
