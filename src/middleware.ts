import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_PATHS = ["/login", "/signup", "/forgot-password", "/reset-password"];

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

const MERCHANT_PATHS = [
  "/dashboard",
  "/listings",
  "/analytics",
  "/earnings",
  "/merchant-orders",
];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  const isAuthPath = AUTH_PATHS.some((p) => path.startsWith(p));
  const isProtected = PROTECTED_PATHS.some((p) => path.startsWith(p));
  const isMerchantPath = MERCHANT_PATHS.some((p) => path.startsWith(p));

  // Redirect signed-in users away from auth pages
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL("/marketplace", req.url));
  }

  // Require login for protected paths
  if (isProtected && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isProtected) {
    // Redirect non-onboarded users to onboarding
    if (!token.onboardingDone && path !== "/onboarding") {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // Redirect buyers away from merchant-only pages
    const roles = (token.roles as string[] | undefined) ?? [];
    if (isMerchantPath && !roles.includes("MERCHANT")) {
      return NextResponse.redirect(new URL("/marketplace", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|icon|apple-icon|manifest\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
