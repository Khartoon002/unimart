import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

// Auth pages — redirect to marketplace if already signed in
const AUTH_PATHS = ["/login", "/signup", "/forgot-password", "/reset-password"];

// Pages that require authentication
const PROTECTED_PATHS = [
  "/cart",
  "/checkout",
  "/orders",
  "/profile",
  "/settings",
  "/messages",
  "/saved",
  "/notifications",
  "/onboarding",
  "/dashboard",
  "/listings",
  "/earnings",
  "/analytics",
  "/merchant-orders",
];

// Subset of protected paths that also require the MERCHANT role
const MERCHANT_PATHS = [
  "/dashboard",
  "/listings",
  "/analytics",
  "/earnings",
  "/merchant-orders",
];

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const path = nextUrl.pathname;

  const isAuthPath = AUTH_PATHS.some((p) => path.startsWith(p));
  const isProtected = PROTECTED_PATHS.some((p) => path.startsWith(p));
  const isMerchantPath = MERCHANT_PATHS.some((p) => path.startsWith(p));

  // Redirect signed-in users away from auth pages
  if (isAuthPath && session?.user) {
    return NextResponse.redirect(new URL("/marketplace", req.url));
  }

  // Require login for protected paths
  if (isProtected && !session?.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  if (session?.user && isProtected) {
    // Redirect non-onboarded users to onboarding
    if (!session.user.onboardingDone && path !== "/onboarding") {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // Redirect buyers away from merchant-only pages
    const roles = ((session.user as unknown as Record<string, unknown>).roles as string[] | undefined) ?? [];
    if (isMerchantPath && !roles.includes("MERCHANT")) {
      return NextResponse.redirect(new URL("/marketplace", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|icon|apple-icon|manifest\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
