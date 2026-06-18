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

function buildFrontmatter(meta: Record<string, string>) {
  return "---\n" + Object.entries(meta).map(([k, v]) => `${k}: ${v}`).join("\n") + "\n---\n"
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  for (const s of ["draft", "pending", "published"] as const) {
    const fp = path.join(contentDir, s, `${slug}.md`)
    if (fs.existsSync(fp)) {
      const raw = fs.readFileSync(fp, "utf-8")
      const { meta, content } = parseFrontmatter(raw)
      return NextResponse.json({ slug, ...meta, content, status: s })
    }
  }
  return NextResponse.json({ error: "not found" }, { status: 404 })
}

export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const body = await request.json()
  const fp = path.join(contentDir, "draft", `${slug}.md`)
  if (!fs.existsSync(fp)) return NextResponse.json({ error: "not found" }, { status: 404 })

  const raw = fs.readFileSync(fp, "utf-8")
  const { meta } = parseFrontmatter(raw)
  const newMeta = {
    ...meta,
    title: body.title || meta.title,
    summary: body.summary || meta.summary,
    tags: body.tags || meta.tags,
    source: meta.source || "",
    source_url: meta.source_url || "",
    status: "pending",
  }
  const content = body.content || ""
  const dst = path.join(contentDir, "pending", `${slug}.md`)
  fs.writeFileSync(dst, buildFrontmatter(newMeta) + content + "\n")
  fs.unlinkSync(fp)
  return NextResponse.json({ ok: true })
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { auto_edit } = await request.json()

  const fp = path.join(contentDir, "draft", `${slug}.md`)
  if (!fs.existsSync(fp)) return NextResponse.json({ error: "not found" }, { status: 404 })

  const raw = fs.readFileSync(fp, "utf-8")
  const { meta, content } = parseFrontmatter(raw)

  if (auto_edit) {
    const apiKey = process.env.LLM_API_KEY
    const apiUrl = process.env.LLM_API_URL || "https://api.deepseek.com/v1/chat/completions"
    const model = process.env.LLM_MODEL || "deepseek-chat"

    if (!apiKey) return NextResponse.json({ error: "LLM_API_KEY not configured" }, { status: 400 })

    const prompt = `你是一个专业的财经资讯编辑。请根据以下素材，改写成一篇原创的财经资讯文章。

要求：
1. 重新组织语言，不得直接复制原文
2. 增加专业的分析视角
3. 文章结构清晰，适合快速阅读
4. 标题要吸引人且准确
5. 正文保持在 300-500 字
6. 输出格式为 Markdown

原文标题：${meta.title || ""}
原文摘要：${meta.summary || ""}
所属分类：${meta.tags || meta.category || "财经"}

请输出：
## 标题
（改写后的标题）

## 正文
（改写后的正文）`

    try {
      const resp = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 1500,
        }),
      })
      if (!resp.ok) {
        const errText = await resp.text()
        return NextResponse.json({ error: `LLM API error: ${errText}` }, { status: 500 })
      }
      const result = await resp.json()
      const rewritten = result.choices?.[0]?.message?.content || ""

      const lines = rewritten.split("\n")
      let newTitle = meta.title || ""
      let bodyLines: string[] = []
      let inBody = false
      for (const line of lines) {
        if (line.startsWith("## 标题")) continue
        else if (line.startsWith("## 正文")) inBody = true
        else if (inBody) bodyLines.push(line)
      }
      const rewrittenContent = bodyLines.join("\n").trim() || rewritten

      const newMeta = { ...meta, title: newTitle, status: "pending" }
      const dst = path.join(contentDir, "pending", `${slug}.md`)
      fs.writeFileSync(dst, buildFrontmatter(newMeta) + rewrittenContent + "\n")
      fs.unlinkSync(fp)
      return NextResponse.json({ ok: true, title: newTitle, content: rewrittenContent })
    } catch (e: any) {
      return NextResponse.json({ error: `LLM request failed: ${e.message}` }, { status: 500 })
    }
  }

  return NextResponse.json({ error: "invalid action" }, { status: 400 })
}
