import { MetadataRoute } from "next";
import { seoOrigin } from "@/lib/seo-origin";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/wallet", "/profile", "/history", "/spin-wheel", "/rewards"],
      },
    ],
    sitemap: `${seoOrigin()}/sitemap.xml`,
  };
}
