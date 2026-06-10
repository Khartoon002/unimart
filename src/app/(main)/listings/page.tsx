import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { StatusBadge } from "@/components/unimart/StatusBadge";
import { PriceTag } from "@/components/unimart/PriceTag";
import { EmptyState } from "@/components/unimart/EmptyState";
import { PauseToggleButton } from "@/components/unimart/PauseToggleButton";
import { ShoppingBag } from "lucide-react";

export default async function ListingsPage() {
  const session = await auth();
  if (!session?.user?.merchantProfileId) redirect("/onboarding");

  const products = await prisma.product.findMany({
    where: { merchantId: session.user.merchantProfileId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">My Listings</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-text-2)" }}>
            {products.length} product{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/listings/new">
          <button className="flex items-center gap-2 h-10 px-4 rounded-xl font-semibold text-sm"
            style={{ background: "var(--color-primary)", color: "#fff" }}>
            <Plus size={16} /> New listing
          </button>
        </Link>
      </div>

      {products.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="No listings yet"
          description="Add your first product and start selling to students on campus."
          action={{ label: "Add product", href: "/listings/new" }} />
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div key={product.id} className="flex items-center gap-3 p-4 rounded-2xl"
              style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
              {/* Thumbnail */}
              <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden flex-shrink-0"
                style={{ background: "var(--color-surface-2)" }}>
                {product.images[0] && (
                  <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link href={`/product/${product.id}`}>
                  <p className="font-medium text-sm truncate hover:underline">{product.title}</p>
                </Link>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <PriceTag price={Number(product.price)} size="sm" />
                  <span className="text-xs hidden sm:inline" style={{ color: "var(--color-text-3)" }}>
                    {product.stock} in stock
                  </span>
                  {/* Status badge inline on mobile */}
                  <span className="sm:hidden">
                    <StatusBadge status={product.status} />
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="hidden sm:block">
                  <StatusBadge status={product.status} />
                </span>
                <PauseToggleButton productId={product.id} status={product.status} />
                <Link href={`/listings/${product.id}/edit`}>
                  <button className="h-8 px-3 rounded-lg text-xs font-semibold"
                    style={{ border: "1px solid var(--color-border)", color: "var(--color-text-2)" }}>
                    Edit
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
