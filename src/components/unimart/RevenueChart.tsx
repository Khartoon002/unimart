"use client";

import { formatPrice } from "@/lib/utils";

interface DataPoint { date: string; revenue: number }

interface RevenueChartProps {
  data: DataPoint[];
  height?: number;
}

export function RevenueChart({ data, height = 160 }: RevenueChartProps) {
  if (!data.length) return null;

  const max = Math.max(...data.map((d) => d.revenue), 1);
  const W = 100 / data.length;

  return (
    <div className="w-full select-none" style={{ height }}>
      <svg viewBox={`0 0 ${data.length * 40} ${height}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="rev-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Fill area */}
        <path
          d={[
            `M 0 ${height}`,
            ...data.map((d, i) => `L ${i * 40 + 20} ${height - (d.revenue / max) * (height - 12)}`),
            `L ${(data.length - 1) * 40 + 20} ${height}`,
            "Z",
          ].join(" ")}
          fill="url(#rev-fill)"
        />

        {/* Line */}
        <path
          d={data.map((d, i) => `${i === 0 ? "M" : "L"} ${i * 40 + 20} ${height - (d.revenue / max) * (height - 12)}`).join(" ")}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Dots */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={i * 40 + 20}
            cy={height - (d.revenue / max) * (height - 12)}
            r="3"
            fill="var(--color-primary)"
            stroke="var(--color-bg)"
            strokeWidth="2"
          />
        ))}
      </svg>

      {/* X-axis labels */}
      <div className="flex justify-between mt-1 px-1">
        {data.map((d) => (
          <span key={d.date} className="text-xs" style={{ color: "var(--color-text-3)" }}>
            {new Date(d.date).toLocaleDateString("en", { weekday: "short" })}
          </span>
        ))}
      </div>
    </div>
  );
}
