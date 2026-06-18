import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const configPath = path.join(process.cwd(), "config", "channels.json")

function readChannels(): any[] {
  if (!fs.existsSync(configPath)) return []
  return JSON.parse(fs.readFileSync(configPath, "utf-8"))
}

function writeChannels(channels: any[]) {
  fs.writeFileSync(configPath, JSON.stringify(channels, null, 2))
}

export async function GET() {
  return NextResponse.json(readChannels())
}

export async function POST(request: Request) {
  const body = await request.json()
  const channels = readChannels()
  const id = body.id || `ch_${Date.now()}`
  channels.push({ id, ...body, enabled: body.enabled !== false, config: body.config || {} })
  writeChannels(channels)
  return NextResponse.json({ ok: true })
}

export async function PUT(request: Request) {
  const body = await request.json()
  const channels = readChannels()
  const idx = channels.findIndex((c: any) => c.id === body.id)
  if (idx >= 0) channels[idx] = { ...channels[idx], ...body }
  writeChannels(channels)
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const { id } = await request.json()
  if (id === "website") return NextResponse.json({ ok: false, message: "不能删除主站渠道" })
  const channels = readChannels().filter((c: any) => c.id !== id)
  writeChannels(channels)
  return NextResponse.json({ ok: true })
}
