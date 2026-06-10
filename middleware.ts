import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const MERCHANT_ONLY = ["/dashboard", "/listings", "/earnings", "/analytics", "/merchant-orders"];
const AUTH_PAGES = ["/login", "/signup", "/forgot-password"];

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const pathname = nextUrl.pathname;

  const isAuthed = !!session?.user;
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  // Redirect authenticated users away from auth pages
  if (isAuthed && isAuthPage) {
    return NextResponse.redirect(new URL("/marketplace", nextUrl));
  }

  // Redirect unauthenticated users to login
  if (!isAuthed && !isAuthPage && !pathname.startsWith("/api")) {
    return NextResponse.redirect(new URL(`/login?from=${encodeURIComponent(pathname)}`, nextUrl));
  }

  if (isAuthed) {
    // Redirect users who haven't completed onboarding
    if (!session.user.onboardingDone && pathname !== "/onboarding") {
      return NextResponse.redirect(new URL("/onboarding", nextUrl));
    }

    // Merchant-only route guard
    const isMerchantRoute = MERCHANT_ONLY.some((r) => pathname.startsWith(r));
    if (isMerchantRoute && !session.user.roles.includes("MERCHANT")) {
      return NextResponse.redirect(new URL("/marketplace?error=merchant_only", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};