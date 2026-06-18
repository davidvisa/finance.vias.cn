import type { MetadataRoute } from "next"
import { getPublishedArticles } from "@/lib/content"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    { url: "https://finance.vias.cn", lastModified: new Date(), changeFrequency: "daily" as const, priority: 1 },
    { url: "https://finance.vias.cn/articles", lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    { url: "https://finance.vias.cn/services/bank", lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: "https://finance.vias.cn/services/stock", lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: "https://finance.vias.cn/services/insurance", lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: "https://finance.vias.cn/contact", lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
  ]

  const articlePages = (await getPublishedArticles()).map((a) => ({
    url: `https://finance.vias.cn/articles/${a.slug}`,
    lastModified: new Date(a.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  return [...staticPages, ...articlePages]
}
