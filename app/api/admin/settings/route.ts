import { NextResponse } from "next/server"
import { readFile, commitFile } from "@/lib/github"

const SETTINGS_PATH = "config/platforms.json"

export async function GET() {
  const raw = await readFile(SETTINGS_PATH)
  if (!raw) {
    return NextResponse.json({
      wechat: { appid: "", appsecret: "" },
      zhihu: { token: "" },
      xueqiu: { cookie: "" },
      toutiao: { token: "" },
      xiaohongshu: { cookie: "" },
    })
  }
  try {
    return NextResponse.json(JSON.parse(raw))
  } catch {
    return NextResponse.json({})
  }
}

export async function PUT(request: Request) {
  const body = await request.json()
  if (!process.env.GITHUB_TOKEN) {
    return NextResponse.json({ error: "GITHUB_TOKEN not configured" }, { status: 500 })
  }
  try {
    await commitFile(
      SETTINGS_PATH,
      JSON.stringify(body, null, 2),
      "chore: update platform settings [skip ci]"
    )
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
