import { MetadataRoute } from "next";
import { GUIDES } from "@/content/guides";
import { seoOrigin } from "@/lib/seo-origin";

export const dynamic = "force-dynamic";

// Only public, self-canonical pages whose content is in the server HTML (the landing page and the guides).
// Left out: /lobby, /wallet, /profile … need login (proxy.ts redirects guests); /live is noindex;
// /login and /register canonicalise to "/" and, like /install, render their content only in the browser.
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
  ];
}
