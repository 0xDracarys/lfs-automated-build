import type { MetadataRoute } from "next";

/**
 * Sitemap for the public site. Set NEXT_PUBLIC_SITE_URL in production
 * (e.g. https://your-domain.tld) — Vercel's production URL is used as a
 * fallback so previews never advertise localhost.
 */
function siteBase(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}

const ROUTES: Array<{ path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" | "yearly" }> = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/learn", priority: 0.9, changeFrequency: "weekly" },
  { path: "/build", priority: 0.9, changeFrequency: "weekly" },
  { path: "/downloads", priority: 0.9, changeFrequency: "daily" },
  { path: "/vuln-hub", priority: 0.9, changeFrequency: "weekly" },
  { path: "/vulnbox", priority: 0.8, changeFrequency: "monthly" },
  { path: "/commands", priority: 0.7, changeFrequency: "monthly" },
  { path: "/docs", priority: 0.7, changeFrequency: "monthly" },
  { path: "/research", priority: 0.6, changeFrequency: "monthly" },
  { path: "/about", priority: 0.5, changeFrequency: "yearly" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
  { path: "/legal", priority: 0.6, changeFrequency: "yearly" },
  { path: "/legal/acceptable-use", priority: 0.6, changeFrequency: "yearly" },
  { path: "/legal/security", priority: 0.6, changeFrequency: "yearly" },
  { path: "/legal/ethics", priority: 0.6, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.4, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.4, changeFrequency: "yearly" },
  { path: "/cookies", priority: 0.4, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteBase();
  const lastModified = new Date();
  return ROUTES.map((r) => ({
    url: `${base}${r.path}`,
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
