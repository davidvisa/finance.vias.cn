import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const configPath = path.join(process.cwd(), "config", "sources.json")

function readSources(): any[] {
  if (!fs.existsSync(configPath)) return []
  return JSON.parse(fs.readFileSync(configPath, "utf-8"))
}

function writeSources(sources: any[]) {
  fs.writeFileSync(configPath, JSON.stringify(sources, null, 2))
}

export async function GET() {
  return NextResponse.json(readSources())
}

export async function POST(request: Request) {
  const body = await request.json()
  const sources = readSources()
  const id = body.id || `src_${Date.now()}`
  sources.push({ id, ...body, enabled: body.enabled !== false })
  writeSources(sources)
  return NextResponse.json({ ok: true })
}

export async function PUT(request: Request) {
  const body = await request.json()
  const sources = readSources()
  const idx = sources.findIndex((s: any) => s.id === body.id)
  if (idx >= 0) sources[idx] = { ...sources[idx], ...body }
  writeSources(sources)
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const { id } = await request.json()
  const sources = readSources().filter((s: any) => s.id !== id)
  writeSources(sources)
  return NextResponse.json({ ok: true })
}
