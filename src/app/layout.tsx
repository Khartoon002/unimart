import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Toaster } from "sonner";
import { NavigationProgress } from "@/components/layout/NavigationProgress";

export const metadata: Metadata = {
  title: { default: "UniMart", template: "%s · UniMart" },
  description: "The student-to-student marketplace for your campus",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "UniMart",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#6C63FF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=satoshi@400,500,700&display=swap"
        />
      </head>
      <body className="min-h-full antialiased" style={{ background: "var(--color-bg)", color: "var(--color-text-1)" }}>
        <SessionProvider>
          <QueryProvider>
            <Suspense>
              <NavigationProgress />
            </Suspense>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-1)",
                },
              }}
            />
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}