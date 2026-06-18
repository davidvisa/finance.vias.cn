import { NextResponse } from "next/server"
import { getPublishedArticles } from "@/lib/content"

export async function GET() {
  const articles = getPublishedArticles()
  const data = articles.map((a) => ({
    title: a.title,
    date: a.date,
    summary: a.summary,
    tags: a.tags,
    source: a.source,
    url: `https://finance.vias.cn/articles/${a.slug}`,
    content: a.content,
  }))
  return NextResponse.json(data)
}
