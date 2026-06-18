import fs from "fs"
import path from "path"
import { cache } from "react"

export interface ArticleMeta {
  slug: string
  title: string
  date: string
  summary: string
  tags: string[]
  source?: string
  status: "draft" | "pending" | "published"
}

export interface Article extends ArticleMeta {
  content: string
}

const contentDir = path.join(process.cwd(), "content", "articles")

function parseFrontmatter(raw: string): { meta: Record<string, string>; content: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) return { meta: {}, content: raw }
  const meta: Record<string, string> = {}
  for (const line of match[1]!.split("\n")) {
    const sep = line.indexOf(": ")
    if (sep > 0) {
      meta[line.slice(0, sep).trim()] = line.slice(sep + 2).trim()
    }
  }
  return { meta, content: match[2]!.trim() }
}

export const getPublishedArticles = cache((): Article[] => {
  const dir = path.join(contentDir, "published")
  if (!fs.existsSync(dir)) return []
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"))
  const articles: Article[] = []
  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), "utf-8")
    const { meta, content } = parseFrontmatter(raw)
    articles.push({
      slug: file.replace(/\.md$/, ""),
      title: meta.title || file,
      date: meta.date || "",
      summary: meta.summary || "",
      tags: meta.tags ? meta.tags!.split(",").map((t) => t.trim()) : [],
      source: meta.source,
      status: "published",
      content,
    })
  }
  articles.sort((a, b) => (a.date > b.date ? -1 : 1))
  return articles
})

export const getArticleBySlug = cache((slug: string): Article | null => {
  for (const status of ["published", "pending", "draft"] as const) {
    const filePath = path.join(contentDir, status, `${slug}.md`)
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8")
      const { meta, content } = parseFrontmatter(raw)
      return {
        slug,
        title: meta.title || slug,
        date: meta.date || "",
        summary: meta.summary || "",
        tags: meta.tags ? meta.tags!.split(",").map((t) => t.trim()) : [],
        source: meta.source,
        status,
        content,
      }
    }
  }
  return null
})
