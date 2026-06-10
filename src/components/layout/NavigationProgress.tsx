"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const prevRoute = useRef(pathname + searchParams.toString());
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Complete bar when route finishes loading
  useEffect(() => {
    const current = pathname + searchParams.toString();
    if (current !== prevRoute.current) {
      prevRoute.current = current;
      // Jump to 100%, then fade out
      if (tickRef.current) clearInterval(tickRef.current);
      setWidth(100);
      hideRef.current = setTimeout(() => {
        setVisible(false);
        setWidth(0);
      }, 300);
    }
  }, [pathname, searchParams]);

  // Intercept link clicks to start the bar
  useEffect(() => {
    function onLinkClick(e: MouseEvent) {
      const anchor = (e.target as Element).closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";
      // Skip external, hash, and same-page links
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("http") ||
        href.startsWith("mailto") ||
        href.startsWith("tel") ||
        anchor.target === "_blank"
      ) return;
      // Skip if same route
      const destination = new URL(href, window.location.href);
      if (destination.pathname + destination.search === prevRoute.current) return;

      // Start the fake progress
      if (hideRef.current) clearTimeout(hideRef.current);
      if (tickRef.current) clearInterval(tickRef.current);
      setVisible(true);
      setWidth(8);

      let w = 8;
      tickRef.current = setInterval(() => {
        // Slow down as we approach 85%
        const step = w < 30 ? 6 : w < 60 ? 3 : w < 80 ? 1 : 0.3;
        w = Math.min(w + step, 85);
        setWidth(w);
        if (w >= 85) {
          clearInterval(tickRef.current!);
          tickRef.current = null;
        }
      }, 120);
    }

    document.addEventListener("click", onLinkClick);
    return () => {
      document.removeEventListener("click", onLinkClick);
      if (tickRef.current) clearInterval(tickRef.current);
      if (hideRef.current) clearTimeout(hideRef.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 z-[200] h-[3px] pointer-events-none"
      style={{
        width: `${width}%`,
        background: "var(--color-primary)",
        boxShadow: "0 0 10px var(--color-primary), 0 0 4px var(--color-primary)",
        transition: width === 100 ? "width 0.15s ease" : "width 0.1s linear",
      }}
    />
  );
}
