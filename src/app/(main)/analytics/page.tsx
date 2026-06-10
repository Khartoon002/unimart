import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMerchantDashboard } from "@/server/actions/merchant.actions";
import { RevenueChart } from "@/components/unimart/RevenueChart";
import { DashboardStatCard } from "@/components/unimart/DashboardStatCard";
import { formatPrice } from "@/lib/utils";
import { Package, Star, Eye, TrendingUp } from "lucide-react";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.merchantProfileId) redirect("/onboarding");

  const result = await getMerchantDashboard();
  if ("error" in result || !result.data) return <p>Failed to load analytics.</p>;

  const { merchant, stats, revenueChart } = result.data;

  const chartData = (revenueChart as { day: string; value: number }[]).map((r, i) => ({
    date: new Date(Date.now() - (6 - i) * 86400000).toISOString(),
    revenue: r.value,
  }));

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold">Analytics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStatCard label="Total earned" value={formatPrice(stats.totalEarned)} icon={TrendingUp} color="var(--color-success)" />
        <DashboardStatCard label="Active listings" value={stats.activeListings.toLocaleString()} icon={Package} />
        <DashboardStatCard label="Store rating" value={stats.rating.toFixed(1)} icon={Star} color="var(--color-accent)" />
        <DashboardStatCard label="Pending orders" value={stats.pendingOrders.toLocaleString()} icon={Eye} />
      </div>

      <div className="p-5 rounded-2xl" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <h2 className="font-semibold mb-6">Revenue — last 7 days</h2>
        <RevenueChart data={chartData} height={200} />
      </div>
    </div>
  );
}
