import { NextResponse } from "next/server"
import { readFile } from "@/lib/github"

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

// Fetch directory listing from GitHub API
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status") || "pending"

  const files = await listDir(`content/articles/${status}`)
  const articles = []

  for (const file of files) {
    const slug = file.replace(/\.md$/, "")
    const raw = await readFile(`content/articles/${status}/${file}`)
    if (!raw) continue
    const { meta } = parseFrontmatter(raw)
    articles.push({
      slug,
      title: meta.title || file,
      date: meta.date || "",
      summary: meta.summary || "",
      status,
    })
  }

  articles.sort((a, b) => (a.date > b.date ? -1 : 1))
  return NextResponse.json(articles)
}

export async function PUT(request: Request) {
  const { slug, status } = await request.json()
  if (!slug || !status) return NextResponse.json({ ok: false }, { status: 400 })

  const { commitFile, deleteFile } = await import("@/lib/github")

  for (const s of ["draft", "pending", "published"] as const) {
    const raw = await readFile(`content/articles/${s}/${slug}.md`)
    if (raw) {
      const { meta, content } = parseFrontmatter(raw)
      const newMeta = { ...meta, status }
      const frontmatter = "---\n" + Object.entries(newMeta).map(([k, v]) => `${k}: ${v}`).join("\n") + "\n---\n"
      const fileContent = frontmatter + content + "\n"

      await commitFile(
        `content/articles/${status}/${slug}.md`,
        fileContent,
        `chore: move article '${slug}' to ${status} [skip ci]`
      )
      if (s !== status) {
        await deleteFile(
          `content/articles/${s}/${slug}.md`,
          `chore: remove article '${slug}' from ${s} [skip ci]`
        )
      }
      return NextResponse.json({ ok: true })
    }
  }
  return NextResponse.json({ ok: false }, { status: 404 })
}
