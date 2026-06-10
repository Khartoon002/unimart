"use client";

import { ReactNode } from "react";
import { useUIStore } from "@/stores/uiStore";

export function MainContent({ children }: { children: ReactNode }) {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const w = collapsed ? 64 : 240;

  return (
    <div
      className="transition-[padding] duration-300 min-h-screen"
      // clamp trick: 0 on mobile (<768px), sidebar width on desktop
      style={{ paddingLeft: `clamp(0px, calc((100vw - 767px) * 9999), ${w}px)` }}
    >
      {children}
    </div>
  );
}