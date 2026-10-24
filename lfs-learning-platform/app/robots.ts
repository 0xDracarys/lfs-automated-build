import type { MetadataRoute } from "next";

/**
 * robots.txt — index the public learning surface, keep private and
 * machine endpoints out of search results.
 */
function siteBase(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}

export default function robots(): MetadataRoute.Robots {
  const base = siteBase();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin", "/dashboard", "/auth/", "/setup"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
