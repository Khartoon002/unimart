import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMerchantDashboard } from "@/server/actions/merchant.actions";
import { DashboardStatCard } from "@/components/unimart/DashboardStatCard";
import { RevenueChart } from "@/components/unimart/RevenueChart";
import { StatusBadge } from "@/components/unimart/StatusBadge";
import { formatPrice, formatRelativeTime } from "@/lib/utils";
import { Wallet, Package, Star, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.merchantProfileId) redirect("/onboarding");

  const result = await getMerchantDashboard();
  if ("error" in result || !result.data) return <p>Failed to load dashboard.</p>;

  const { merchant, stats, recentOrders, revenueChart } = result.data;

  const chartData = (revenueChart as { day: string; value: number }[]).map((r, i) => ({
    date: new Date(Date.now() - (6 - i) * 86400000).toISOString(),
    revenue: r.value,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-text-2)" }}>Welcome back, {merchant.user.name}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStatCard label="Total earned" value={formatPrice(stats.totalEarned)} icon={Wallet} color="var(--color-success)" />
        <DashboardStatCard label="Withdrawable" value={formatPrice(stats.withdrawableBalance)} icon={Wallet} color="var(--color-primary)" />
        <DashboardStatCard label="Pending orders" value={stats.pendingOrders.toString()} icon={Package} />
        <DashboardStatCard label="Active listings" value={stats.activeListings.toString()} icon={ShoppingBag} />
      </div>

      {/* Revenue chart */}
      <div className="p-5 rounded-2xl" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <h2 className="font-semibold mb-4">Revenue (last 7 days)</h2>
        <RevenueChart data={chartData} />
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Recent orders</h2>
          <Link href="/merchant-orders" className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>View all</Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: "var(--color-text-3)" }}>No orders yet. Share your store!</p>
        ) : (
          <div className="space-y-2">
            {recentOrders.slice(0, 5).map((order: { id: string; paystackRef: string | null; total: number; status: string; createdAt: string | Date }) => (
              <Link key={order.id} href={`/merchant-orders/${order.id}`}
                className="flex items-center justify-between p-4 rounded-xl transition-colors hover-border-primary block"
                style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                <div>
                  <p className="text-sm font-semibold">{order.paystackRef ?? order.id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-text-3)" }}>{formatRelativeTime(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-sm">{formatPrice(Number(order.total))}</span>
                  <StatusBadge status={order.status as Parameters<typeof StatusBadge>[0]["status"]} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
