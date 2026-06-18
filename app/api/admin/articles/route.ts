import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const contentDir = path.join(process.cwd(), "content", "articles")

function parseFrontmatter(raw: string): { meta: Record<string, string>; content: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) return { meta: {}, content: raw }
  const meta: Record<string, string> = {}
  for (const line of match[1]!.split("\n")) {
    const sep = line.indexOf(": ")
    if (sep > 0) meta[line.slice(0, sep).trim()] = line.slice(sep + 2).trim()
  }
  return { meta, content: match[2]!.trim() }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status") || "pending"
  const dir = path.join(contentDir, status)
  if (!fs.existsSync(dir)) return NextResponse.json([])

  const files = fs.readdirSync(dir).filter(f => f.endsWith(".md"))
  const articles = files.map(file => {
    const raw = fs.readFileSync(path.join(dir, file), "utf-8")
    const { meta } = parseFrontmatter(raw)
    return { slug: file.replace(/\.md$/, ""), title: meta.title || file, date: meta.date || "", summary: meta.summary || "", status }
  })
  articles.sort((a, b) => (a.date > b.date ? -1 : 1))
  return NextResponse.json(articles)
}

export async function PUT(request: Request) {
  const { slug, status } = await request.json()
  if (!slug || !status) return NextResponse.json({ ok: false }, { status: 400 })

  for (const s of ["draft", "pending", "published"] as const) {
    const src = path.join(contentDir, s, `${slug}.md`)
    if (fs.existsSync(src)) {
      const dest = path.join(contentDir, status, `${slug}.md`)
      const raw = fs.readFileSync(src, "utf-8")
      const { meta, content } = parseFrontmatter(raw)
      const newMeta = { ...meta, status }
      const frontmatter = Object.entries(newMeta).map(([k, v]) => `${k}: ${v}`).join("\n")
      fs.writeFileSync(dest, `---\n${frontmatter}\n---\n${content}`)
      if (s !== status) fs.unlinkSync(src)
      return NextResponse.json({ ok: true })
    }
  }
  return NextResponse.json({ ok: false }, { status: 404 })
}
