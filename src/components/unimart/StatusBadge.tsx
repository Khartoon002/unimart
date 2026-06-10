const variants: Record<string, { bg: string; color: string; dot: string; label: string }> = {
  // Product statuses
  ACTIVE:     { bg: "rgba(34,197,94,0.12)",  color: "#22c55e", dot: "#22c55e", label: "Live" },
  PAUSED:     { bg: "rgba(156,163,175,0.12)", color: "#9ca3af", dot: "#9ca3af", label: "Paused" },
  INACTIVE:   { bg: "rgba(156,163,175,0.12)", color: "#9ca3af", dot: "#9ca3af", label: "Paused" },
  DRAFT:      { bg: "rgba(245,158,11,0.12)",  color: "#f59e0b", dot: "#f59e0b", label: "Draft" },
  EXPIRED:    { bg: "rgba(239,68,68,0.12)",   color: "#ef4444", dot: "#ef4444", label: "Expired" },
  // Order statuses
  PENDING:    { bg: "rgba(245,158,11,0.12)",  color: "#f59e0b", dot: "#f59e0b", label: "Pending" },
  CONFIRMED:  { bg: "rgba(59,130,246,0.12)",  color: "#3b82f6", dot: "#3b82f6", label: "Confirmed" },
  PROCESSING: { bg: "rgba(168,85,247,0.12)",  color: "#a855f7", dot: "#a855f7", label: "Processing" },
  SHIPPED:    { bg: "rgba(99,102,241,0.12)",  color: "#6366f1", dot: "#6366f1", label: "Shipped" },
  DELIVERED:  { bg: "rgba(34,197,94,0.12)",   color: "#22c55e", dot: "#22c55e", label: "Delivered" },
  CANCELLED:  { bg: "rgba(239,68,68,0.12)",   color: "#ef4444", dot: "#ef4444", label: "Cancelled" },
  DISPUTED:   { bg: "rgba(249,115,22,0.12)",  color: "#f97316", dot: "#f97316", label: "Disputed" },
};

const fallback = { bg: "rgba(156,163,175,0.12)", color: "#9ca3af", dot: "#9ca3af" };

export function StatusBadge({ status }: { status: string }) {
  const v = variants[status] ?? { ...fallback, label: status };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: v.bg, color: v.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: v.dot }} />
      {v.label}
    </span>
  );
}
