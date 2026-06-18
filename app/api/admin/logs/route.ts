import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  const logPath = path.join(process.cwd(), "config", "logs.json")
  if (!fs.existsSync(logPath)) return NextResponse.json([])
  const logs = JSON.parse(fs.readFileSync(logPath, "utf-8"))
  return NextResponse.json(logs.slice(-100).reverse())
}
