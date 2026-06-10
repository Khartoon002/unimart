import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Auth pages — redirect to marketplace if already signed in
const AUTH_PATHS = ["/login", "/signup", "/forgot-password", "/reset-password"];

// Pages that require a session cookie
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

function hasSessionCookie(req: NextRequest): boolean {
  // Check both secure (prod) and plain (dev) cookie names
  return !!(
    req.cookies.get("__Secure-authjs.session-token")?.value ||
    req.cookies.get("authjs.session-token")?.value
  );
}

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const authenticated = hasSessionCookie(req);

  const isAuthPath = AUTH_PATHS.some((p) => path.startsWith(p));
  const isProtected = PROTECTED_PATHS.some((p) => path.startsWith(p));

  // Redirect signed-in users away from auth pages
  if (isAuthPath && authenticated) {
    return NextResponse.redirect(new URL("/marketplace", req.url));
  }

  // Require login for protected paths
  if (isProtected && !authenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  // Pass x-pathname so the server layout can do onboarding / role redirects
  const response = NextResponse.next();
  response.headers.set("x-pathname", path);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|icon|apple-icon|manifest\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
