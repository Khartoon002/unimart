import { CheckCircle2, Circle } from "lucide-react";
import { formatDate } from "@/lib/utils";

const STATUS_STEPS = [
  { key: "PENDING", label: "Order placed" },
  { key: "CONFIRMED", label: "Payment confirmed" },
  { key: "PROCESSING", label: "Being prepared" },
  { key: "SHIPPED", label: "On the way" },
  { key: "DELIVERED", label: "Delivered" },
] as const;

type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "DISPUTED";

interface Event { status: OrderStatus; createdAt: string | Date; note?: string | null }

interface OrderTimelineProps {
  currentStatus: OrderStatus;
  events?: Event[];
}

export function OrderTimeline({ currentStatus, events = [] }: OrderTimelineProps) {
  if (currentStatus === "CANCELLED" || currentStatus === "REFUNDED") {
    return (
      <div className="rounded-2xl p-5 text-center"
        style={{ background: "var(--color-surface-2)", border: "1px dashed var(--color-border)" }}>
        <p className="font-semibold" style={{ color: "var(--color-danger)" }}>
          Order {currentStatus.toLowerCase()}
        </p>
        {events.find((e) => e.status === currentStatus)?.note && (
          <p className="text-xs mt-1" style={{ color: "var(--color-text-3)" }}>
            {events.find((e) => e.status === currentStatus)?.note}
          </p>
        )}
      </div>
    );
  }

  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === currentStatus);

  return (
    <div className="space-y-0">
      {STATUS_STEPS.map((step, i) => {
        const done = i <= currentIdx;
        const active = i === currentIdx;
        const event = events.find((e) => e.status === step.key);

        return (
          <div key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="flex-shrink-0 mt-0.5">
                {done ? (
                  <CheckCircle2 size={18} style={{ color: active ? "var(--color-primary)" : "var(--color-primary)", opacity: active ? 1 : 0.7 }} />
                ) : (
                  <Circle size={18} style={{ color: "var(--color-border)" }} />
                )}
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div className="w-0.5 h-8 my-1 rounded-full" style={{ background: done && i < currentIdx ? "var(--color-primary)" : "var(--color-border)", opacity: 0.5 }} />
              )}
            </div>
            <div className="pb-6">
              <p className="text-sm font-medium" style={{ color: done ? "var(--color-text-1)" : "var(--color-text-3)" }}>{step.label}</p>
              {event && (
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-3)" }}>{formatDate(event.createdAt)}</p>
              )}
              {event?.note && (
                <p className="text-xs mt-0.5 italic" style={{ color: "var(--color-text-2)" }}>{event.note}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
