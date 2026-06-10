import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pusher-js ships a browser build (dist/web/pusher.js) that Turbopack picks
  // up via the "browser" package.json field — even in SSR bundles — and that
  // build accesses self/window/document at module init, crashing static-page
  // generation. Marking it as a server-external keeps it out of the server
  // bundle entirely; the typeof-window guard in getPusherClient() prevents it
  // from ever being required on the server anyway.
  serverExternalPackages: ['pusher-js'],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "**.ufs.sh" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
