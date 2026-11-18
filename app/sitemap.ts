import { MetadataRoute } from "next";
import { GUIDES } from "@/content/guides";
import { seoOrigin } from "@/lib/seo-origin";

export const dynamic = "force-dynamic";

// Only public pages whose content is in the server HTML. /lobby and /promotions need login (they render
// nothing for crawlers) and /live is noindex, so they are left out.
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = seoOrigin();

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/guide`, changeFrequency: "weekly", priority: 0.8 },
    ...GUIDES.map((g) => ({
      url: `${baseUrl}/guide/${g.slug}`,
      lastModified: new Date(`${g.updated}T00:00:00+07:00`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: `${baseUrl}/install`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/register`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/login`, changeFrequency: "monthly", priority: 0.4 },
  ];
}
