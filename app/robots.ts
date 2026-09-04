import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/wallet", "/profile", "/history", "/spin-wheel", "/rewards"],
      },
    ],
    sitemap: "https://snake1168.online/sitemap.xml",
  };
}