import { cache } from "react"

const GITHUB_OWNER = "davidvisa"
const GITHUB_REPO = "finance.vias.cn"
const GITHUB_BRANCH = "main"

async function githubFetch(path: string): Promise<any> {
  const token = process.env.GITHUB_TOKEN
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "ViaFinance",
  }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`,
    { headers }
  )
  if (!res.ok) return null
  return res.json()
}

async function listDir(path: string): Promise<string[]> {
  const data = await githubFetch(path)
  if (!Array.isArray(data)) return []
  return data
    .filter((item: any) => item.name.endsWith(".md") && item.type === "file")
    .map((item: any) => item.name)
}

async function readFileContent(path: string): Promise<string | null> {
  const data = await githubFetch(path)
  if (!data || !data.content) return null
  return Buffer.from(data.content, "base64").toString("utf-8")
}

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

export const getPublishedArticles = cache(async (): Promise<Article[]> => {
  const files = await listDir("content/articles/published")
  const articles: Article[] = []
  for (const file of files) {
    const raw = await readFileContent(`content/articles/published/${file}`)
    if (!raw) continue
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

export const getArticleBySlug = cache(async (slug: string): Promise<Article | null> => {
  for (const status of ["published", "pending", "draft"] as const) {
    const raw = await readFileContent(`content/articles/${status}/${slug}.md`)
    if (raw) {
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
