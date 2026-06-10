import { ReactNode, Suspense } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MobileNav } from "@/components/layout/MobileNav";
import { MainContent } from "@/components/layout/MainContent";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { NavigationProgress } from "@/components/layout/NavigationProgress";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <Suspense><NavigationProgress /></Suspense>

      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Single content area — responsive padding handled in MainContent */}
      <MainContent>
        <TopBar />
        <main className="px-4 md:px-8 pb-24 md:pb-12 pt-2">{children}</main>
      </MainContent>

      {/* Mobile bottom nav */}
      <MobileNav />

      {/* Cart drawer — global, rendered above everything */}
      <CartDrawer />
    </div>
  );
}
