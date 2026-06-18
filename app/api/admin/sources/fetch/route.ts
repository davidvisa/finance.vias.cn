import { NextResponse } from "next/server"

export async function POST() {
  // Will trigger Python fetch script via child process or enqueue task
  // For now, return placeholder
  return NextResponse.json({ ok: true, message: "采集任务已加入队列" })
}
