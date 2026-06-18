export function articleJsonLd({
  title, description, date, url, author = "ViaFinance",
}: {
  title: string; description: string; date: string; url: string; author?: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title,
    description,
    datePublished: date,
    author: { "@type": "Person", name: author },
    publisher: { "@type": "Organization", name: "ViaFinance" },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  }
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ViaFinance",
    description: "全球财经资讯与跨境金融服务平台",
    url: "https://finance.vias.cn",
  }
}
