"use client"

import { useState, useEffect } from "react"

export default function AdminDashboard() {
  const [stats, setStats] = useState({ published: 0, pending: 0, draft: 0, sources: 0, channels: 0 })

  useEffect(() => {
    fetch("/api/admin/stats").then(r => r.json()).then(setStats).catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">管理概览</h1>
      <div className="grid gap-4 md:grid-cols-5">
        {[
          { label: "已发布文章", value: stats.published, color: "bg-green-50 text-green-700 border-green-200" },
          { label: "待审核", value: stats.pending, color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
          { label: "草稿", value: stats.draft, color: "bg-gray-50 text-gray-700 border-gray-200" },
          { label: "数据源", value: stats.sources, color: "bg-blue-50 text-blue-700 border-blue-200" },
          { label: "发布渠道", value: stats.channels, color: "bg-purple-50 text-purple-700 border-purple-200" },
        ].map(item => (
          <div key={item.label} className={`rounded-xl border p-4 ${item.color}`}>
            <div className="text-2xl font-bold">{item.value}</div>
            <div className="mt-1 text-sm">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
