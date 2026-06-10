import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface DashboardStatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  change?: number;
  color?: string;
}

export function DashboardStatCard({ label, value, icon: Icon, change, color = "var(--color-primary)" }: DashboardStatCardProps) {
  const isPositive = (change ?? 0) >= 0;

  return (
    <div className="p-5 rounded-2xl" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium" style={{ color: "var(--color-text-2)" }}>{label}</span>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `color-mix(in srgb, ${color} 12%, transparent)` }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <p className="font-display text-2xl font-bold">{value}</p>
      {change !== undefined && (
        <div className="flex items-center gap-1 mt-2">
          {isPositive ? <TrendingUp size={13} style={{ color: "var(--color-success)" }} /> : <TrendingDown size={13} style={{ color: "var(--color-danger)" }} />}
          <span className="text-xs font-semibold" style={{ color: isPositive ? "var(--color-success)" : "var(--color-danger)" }}>
            {isPositive ? "+" : ""}{change.toFixed(1)}% vs last week
          </span>
        </div>
      )}
    </div>
  );
}
