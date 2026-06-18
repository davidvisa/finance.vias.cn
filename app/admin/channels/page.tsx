"use client"

import { useState, useEffect } from "react"

interface Channel {
  id: string; name: string; type: string; enabled: boolean; config: Record<string, string>
}

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [editing, setEditing] = useState<Partial<Channel> | null>(null)

  const load = () => fetch("/api/admin/channels").then(r => r.json()).then(setChannels)
  useEffect(() => { load() }, [])

  const save = async () => {
    if (!editing?.name) return
    const method = editing.id ? "PUT" : "POST"
    await fetch("/api/admin/channels", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) })
    setEditing(null); load()
  }

  const remove = async (id: string) => {
    if (!confirm("确定删除？")) return
    await fetch("/api/admin/channels", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">发布渠道管理</h1>
        <button onClick={() => setEditing({ enabled: true, type: "api", config: {} })}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light">+ 添加渠道</button>
      </div>

      {editing && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">{editing.id ? "编辑渠道" : "添加渠道"}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <input placeholder="名称" value={editing.name || ""} onChange={e => setEditing({...editing, name: e.target.value})}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <select value={editing.type || "api"} onChange={e => setEditing({...editing, type: e.target.value})}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="website">网站</option>
              <option value="api">API</option>
              <option value="manual">手动</option>
              <option value="export">导出</option>
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
        {channels.map(c => (
          <div key={c.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${c.enabled ? "bg-green-500" : "bg-gray-300"}`} />
              <span className="font-medium text-gray-800">{c.name}</span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">{c.type}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(c)} className="rounded-lg border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50">编辑</button>
              {c.id !== "website" && (
                <button onClick={() => remove(c.id)} className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-500 hover:bg-red-50">删除</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
