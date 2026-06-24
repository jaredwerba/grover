import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://covebud.com";
  const now = new Date();

  // Public, indexable routes only. Excludes protected/admin routes
  // (/chat, /me, /me/dashboard, /login), the noindex QR generator, and
  // pure redirect handlers (/s/[slug], the passport scan route).
  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/business`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/trail`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/strain`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/cove-trail-passport`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/about/cove-ai`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/join`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];
}
