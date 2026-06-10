"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  expiresAt: Date | string;
  onExpired?: () => void;
  size?: "sm" | "base" | "lg";
  showIcon?: boolean;
}

const sizes = { sm: "text-xs", base: "text-sm", lg: "text-xl" };

export function CountdownTimer({ expiresAt, onExpired, size = "base", showIcon = true }: CountdownTimerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    const target = new Date(expiresAt).getTime();
    const calc = () => Math.max(0, Math.floor((target - Date.now()) / 1000));
    setTimeLeft(calc());

    const interval = setInterval(() => {
      const remaining = calc();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onExpired?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpired]);

  if (!isMounted) return null;

  if (timeLeft <= 0) {
    return <span className={`font-price font-bold ${sizes[size]}`} style={{ color: "var(--color-danger)" }}>Expired</span>;
  }

  const h = String(Math.floor(timeLeft / 3600)).padStart(2, "0");
  const m = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, "0");
  const s = String(timeLeft % 60).padStart(2, "0");
  const urgent = timeLeft < 3600;

  return (
    <span
      className={`inline-flex items-center gap-1 font-price font-bold tracking-wide ${sizes[size]} ${urgent ? "animate-fresh-pulse" : ""}`}
      style={{ color: "var(--color-fresh)" }}
    >
      {showIcon && <Clock size={size === "sm" ? 12 : size === "lg" ? 20 : 14} />}
      {h}:{m}:{s}
    </span>
  );
}