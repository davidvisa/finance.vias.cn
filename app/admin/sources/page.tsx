"use client"

import { useState, useEffect } from "react"

interface Source {
  id: string; name: string; url: string; category: string
  selector: string; frequency: string; enabled: boolean
}

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([])
  const [editing, setEditing] = useState<Partial<Source> | null>(null)

  const load = () => fetch("/api/admin/sources").then(r => r.json()).then(setSources)
  useEffect(() => { load() }, [])

  const save = async () => {
    if (!editing?.name) return
    const method = editing.id ? "PUT" : "POST"
    await fetch("/api/admin/sources", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) })
    setEditing(null); load()
  }

  const remove = async (id: string) => {
    if (!confirm("确定删除？")) return
    await fetch("/api/admin/sources", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    load()
  }

  const triggerFetch = async (id: string) => {
    await fetch("/api/admin/sources/fetch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    alert("采集任务已触发")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">数据源管理</h1>
        <button onClick={() => setEditing({ enabled: true, frequency: "daily", category: "news" })}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light">+ 添加数据源</button>
      </div>

      {editing && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">{editing.id ? "编辑数据源" : "添加数据源"}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <input placeholder="名称" value={editing.name || ""} onChange={e => setEditing({...editing, name: e.target.value})}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <input placeholder="URL" value={editing.url || ""} onChange={e => setEditing({...editing, url: e.target.value})}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <select value={editing.category || "news"} onChange={e => setEditing({...editing, category: e.target.value})}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="us_stock">美股</option>
              <option value="hk_stock">港股</option>
              <option value="macro">宏观经济</option>
              <option value="news">财经新闻</option>
              <option value="policy">政策法规</option>
              <option value="insurance">保险资讯</option>
            </select>
            <input placeholder="CSS 选择器" value={editing.selector || ""} onChange={e => setEditing({...editing, selector: e.target.value})}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <select value={editing.frequency || "daily"} onChange={e => setEditing({...editing, frequency: e.target.value})}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="hourly">每小时</option>
              <option value="daily">每天</option>
              <option value="weekly">每周</option>
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.enabled ?? true} onChange={e => setEditing({...editing, enabled: e.target.checked})} />
              启用
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={save} className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-light">保存</button>
            <button onClick={() => setEditing(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">取消</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {sources.map(s => (
          <div key={s.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${s.enabled ? "bg-green-500" : "bg-gray-300"}`} />
                <span className="font-medium text-gray-800">{s.name}</span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">{s.category}</span>
              </div>
              <p className="mt-1 text-xs text-gray-400">{s.url}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => triggerFetch(s.id)} className="rounded-lg border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50">采集</button>
              <button onClick={() => setEditing(s)} className="rounded-lg border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50">编辑</button>
              <button onClick={() => remove(s.id)} className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-500 hover:bg-red-50">删除</button>
            </div>
          </div>
        ))}
        {sources.length === 0 && <p className="py-8 text-center text-gray-400">暂无数据源，点击上方按钮添加</p>}
      </div>
    </div>
  )
}
