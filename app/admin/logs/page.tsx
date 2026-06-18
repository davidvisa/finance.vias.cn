"use client"

import { useState, useEffect } from "react"

interface Log { time: string; source: string; action: string; status: string; message: string }

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([])

  useEffect(() => {
    fetch("/api/admin/logs").then(r => r.json()).then(setLogs).catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">采集日志</h1>
      <div className="space-y-1">
        {logs.map((log, i) => (
          <div key={i} className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs">
            <span className="shrink-0 text-gray-400">{log.time}</span>
            <span className={`shrink-0 font-medium ${log.status === "success" ? "text-green-600" : log.status === "error" ? "text-red-600" : "text-yellow-600"}`}>
              [{log.status}]
            </span>
            <span className="shrink-0 text-gray-500">{log.source}</span>
            <span className="text-gray-700">{log.message}</span>
          </div>
        ))}
        {logs.length === 0 && <p className="py-8 text-center text-gray-400">暂无日志</p>}
      </div>
    </div>
  )
}
