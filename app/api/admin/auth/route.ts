import { NextResponse } from "next/server"
import { cookies } from "next/headers"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123"

export async function GET() {
  const c = await cookies()
  const ok = c.get("admin_token")?.value === "authenticated"
  return NextResponse.json({ ok })
}

export async function POST(request: Request) {
  const { password } = await request.json()
  if (password === ADMIN_PASSWORD) {
    const resp = NextResponse.json({ ok: true })
    resp.cookies.set("admin_token", "authenticated", { httpOnly: true, path: "/", maxAge: 86400 })
    return resp
  }
  return NextResponse.json({ ok: false }, { status: 401 })
}
