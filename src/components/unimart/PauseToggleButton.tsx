"use client";

import { useTransition } from "react";
import { toggleProductStatus } from "@/server/actions/product.actions";
import { toast } from "sonner";
import { Pause, Play } from "lucide-react";

export function PauseToggleButton({ productId, status }: { productId: string; status: string }) {
  const [pending, start] = useTransition();
  const isLive = status === "ACTIVE";

  function handleToggle() {
    start(async () => {
      const result = await toggleProductStatus(productId);
      if (result.error) { toast.error(result.error); return; }
      toast.success(isLive ? "Listing paused" : "Listing is now live");
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={pending}
      className="h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-opacity disabled:opacity-40"
      style={{
        border: "1px solid var(--color-border)",
        color: isLive ? "var(--color-warning)" : "var(--color-success)",
        background: "transparent",
      }}
    >
      {isLive ? <Pause size={11} /> : <Play size={11} />}
      {pending ? "…" : isLive ? "Pause" : "Resume"}
    </button>
  );
}
