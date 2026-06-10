import { ReactNode, Suspense } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MobileNav } from "@/components/layout/MobileNav";
import { MainContent } from "@/components/layout/MainContent";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { NavigationProgress } from "@/components/layout/NavigationProgress";

const MERCHANT_PATHS = [
  "/dashboard",
  "/listings",
  "/analytics",
  "/earnings",
  "/merchant-orders",
];

export default async function MainLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "/";

  if (session?.user) {
    // Redirect non-onboarded users to complete onboarding
    if (!session.user.onboardingDone && pathname !== "/onboarding") {
      redirect("/onboarding");
    }

    // Redirect buyers away from merchant-only pages
    const isMerchantPath = MERCHANT_PATHS.some((p) => pathname.startsWith(p));
    if (isMerchantPath && !session.user.roles?.includes("MERCHANT")) {
      redirect("/marketplace");
    }
  }

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
