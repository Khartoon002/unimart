import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Auth-only pages — redirect away if already signed in
const AUTH_PATHS = ["/login", "/signup", "/forgot-password", "/reset-password"];

// Pages that require a session
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

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Cookie names used by Auth.js (next-auth v5)
  const hasSession = !!(
    req.cookies.get("__Secure-authjs.session-token") ??
    req.cookies.get("authjs.session-token")
  );

  if (AUTH_PATHS.some((p) => path.startsWith(p)) && hasSession) {
    return NextResponse.redirect(new URL("/marketplace", req.url));
  }

  if (PROTECTED_PATHS.some((p) => path.startsWith(p)) && !hasSession) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
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
