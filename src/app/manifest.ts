import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "UniMart",
    short_name: "UniMart",
    description: "The student-to-student marketplace for your campus",
    start_url: "/marketplace",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0C0C0F",
    theme_color: "#6C63FF",
    categories: ["shopping", "education"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    screenshots: [
      {
        src: "/screenshot-wide.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "UniMart Marketplace",
      },
    ],
    shortcuts: [
      {
        name: "Marketplace",
        url: "/marketplace",
        description: "Browse all products",
      },
      {
        name: "Cart",
        url: "/cart",
        description: "View your cart",
      },
    ],
  };
}
