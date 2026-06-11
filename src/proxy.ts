import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Auth-only pages — redirect away if already signed in
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

// Subset that also requires the MERCHANT role
const MERCHANT_PATHS = [
  "/dashboard",
  "/listings",
  "/analytics",
  "/earnings",
  "/merchant-orders",
];

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Runs on Node.js runtime (Next.js 16 proxy convention), so next-auth/jwt is fine
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  const isAuthPath = AUTH_PATHS.some((p) => path.startsWith(p));
  const isProtected = PROTECTED_PATHS.some((p) => path.startsWith(p));
  const isMerchantPath = MERCHANT_PATHS.some((p) => path.startsWith(p));

  if (isAuthPath && token) {
    return NextResponse.redirect(new URL("/marketplace", req.url));
  }

  if (isProtected && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isProtected) {
    if (!token.onboardingDone && path !== "/onboarding") {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
    const roles = (token.roles as string[] | undefined) ?? [];
    if (isMerchantPath && !roles.includes("MERCHANT")) {
      return NextResponse.redirect(new URL("/marketplace", req.url));
    }
  }

  const response = NextResponse.next();
  response.headers.set("x-pathname", path);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|icon|apple-icon|manifest\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
