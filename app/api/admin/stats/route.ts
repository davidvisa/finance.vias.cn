import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  const contentDir = path.join(process.cwd(), "content", "articles")
  const countStatus = (status: string) => {
    const dir = path.join(contentDir, status)
    if (!fs.existsSync(dir)) return 0
    return fs.readdirSync(dir).filter(f => f.endsWith(".md")).length
  }

  const sourcesPath = path.join(process.cwd(), "config", "sources.json")
  const channelsPath = path.join(process.cwd(), "config", "channels.json")

  const sources = fs.existsSync(sourcesPath) ? JSON.parse(fs.readFileSync(sourcesPath, "utf-8")) : []
  const channels = fs.existsSync(channelsPath) ? JSON.parse(fs.readFileSync(channelsPath, "utf-8")) : []

  return NextResponse.json({
    published: countStatus("published"),
    pending: countStatus("pending"),
    draft: countStatus("draft"),
    sources: sources.length,
    channels: channels.length,
  })
}
