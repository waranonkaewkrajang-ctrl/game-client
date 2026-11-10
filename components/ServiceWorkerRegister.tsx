"use client";
import { useEffect } from "react";

/**
 * Registers /sw.js (offline fallback only — see public/sw.js). Production builds only: in `next dev` a
 * service worker would get in the way of hot reload. Renders nothing.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {
      // registration failure only means no offline page; the site works as before
    });
  }, []);
  return null;
}
