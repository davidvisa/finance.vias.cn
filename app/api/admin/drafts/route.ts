import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const contentDir = path.join(process.cwd(), "content", "articles")

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
  const dir = path.join(contentDir, "draft")
  if (!fs.existsSync(dir)) return NextResponse.json([])

  const files = fs.readdirSync(dir).filter(f => f.endsWith(".md"))
  const articles = files.map(file => {
    const raw = fs.readFileSync(path.join(dir, file), "utf-8")
    const { meta } = parseFrontmatter(raw)
    return {
      slug: file.replace(/\.md$/, ""),
      title: meta.title || file,
      date: meta.date || "",
      summary: meta.summary || "",
      tags: meta.tags || "",
      source: meta.source || "",
      category: meta.tags || meta.category || "",
    }
  })
  articles.sort((a, b) => (a.date > b.date ? -1 : 1))

  const filtered = category ? articles.filter(a => a.tags === category || a.category === category) : articles
  return NextResponse.json(filtered)
}
