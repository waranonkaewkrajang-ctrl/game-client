import type { MetadataRoute } from "next";

// Web app manifest (served at /manifest.webmanifest). Used for installability and by the Android TWA
// (android/twa/twa-manifest.json points at it). Icons are built from our own logo (public/logo.png).
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "SNAKE168",
    short_name: "SNAKE168",
    description: "SNAKE168",
    lang: "th",
    dir: "ltr",
    start_url: "/lobby",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#2a1145",
    theme_color: "#2a1145",
    icons: [
      { src: "/pwa/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/pwa/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
