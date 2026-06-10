import type { LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; href?: string; onClick?: () => void };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-rise-in">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5 img-placeholder"
        style={{ color: "var(--color-text-3)" }}
      >
        <Icon size={36} />
      </div>
      <h2 className="font-display text-xl font-semibold mb-2">{title}</h2>
      <p className="text-sm max-w-xs mb-6" style={{ color: "var(--color-text-2)" }}>{description}</p>
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="h-10 px-5 rounded-full font-semibold text-sm flex items-center"
            style={{ background: "var(--color-primary)", color: "#fff" }}
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="h-10 px-5 rounded-full font-semibold text-sm"
            style={{ background: "var(--color-primary)", color: "#fff" }}
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}