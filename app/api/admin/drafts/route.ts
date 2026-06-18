import { NextResponse } from "next/server"
import { readFile } from "@/lib/github"

async function listDir(path: string): Promise<string[]> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/davidvisa/finance.vias.cn/contents/${path}?ref=main`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "ViaFinance",
        },
      }
    )
    if (!res.ok) return []
    const data = await res.json()
    if (!Array.isArray(data)) return []
    return data
      .filter((item: any) => item.name.endsWith(".md") && item.type === "file")
      .map((item: any) => item.name)
  } catch {
    return []
  }
}

function parseFrontmatter(raw: string) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) return { meta: {} as Record<string, string>, content: raw }
  const meta: Record<string, string> = {}
  for (const line of match[1]!.split("\n")) {
    const sep = line.indexOf(": ")
    if (sep > 0) meta[line.slice(0, sep).trim()] = line.slice(sep + 2).trim()
  }
  return { meta, content: match[2]!.trim() }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category") || ""

  const files = await listDir("content/articles/draft")
  const articles = []

  for (const file of files) {
    const raw = await readFile(`content/articles/draft/${file}`)
    if (!raw) continue
    const { meta } = parseFrontmatter(raw)
    articles.push({
      slug: file.replace(/\.md$/, ""),
      title: meta.title || file,
      date: meta.date || "",
      summary: meta.summary || "",
      tags: meta.tags || "",
      source: meta.source || "",
      category: meta.tags || meta.category || "",
    })
  }
  articles.sort((a, b) => (a.date > b.date ? -1 : 1))

  const filtered = category ? articles.filter(a => a.tags === category || a.category === category) : articles
  return NextResponse.json(filtered)
}
