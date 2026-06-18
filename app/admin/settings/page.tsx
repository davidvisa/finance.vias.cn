"use client"

import { useState, useEffect } from "react"

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({
    wechat: { appid: "", appsecret: "" },
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")

  useEffect(() => {
    fetch("/api/admin/settings").then(r => r.json()).then(setSettings)
  }, [])

  const save = async () => {
    setSaving(true)
    setMsg("")
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    })
    const data = await res.json()
    setMsg(data.ok ? "✅ 保存成功" : `❌ 失败: ${data.error}`)
    setSaving(false)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">平台配置</h1>
        <button onClick={save} disabled={saving}
          className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-light disabled:opacity-50">
          {saving ? "保存中…" : "保存配置"}
        </button>
      </div>

      {msg && <p className="text-sm">{msg}</p>}

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-800">微信公众号</h2>
        <p className="mt-1 text-xs text-gray-400">在公众号后台 "开发 → 基本配置" 中获取 AppID 和 AppSecret</p>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">AppID</label>
            <input value={settings.wechat?.appid || ""} onChange={e => setSettings({ ...settings, wechat: { ...settings.wechat, appid: e.target.value } })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="wx..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">AppSecret</label>
            <input value={settings.wechat?.appsecret || ""} onChange={e => setSettings({ ...settings, wechat: { ...settings.wechat, appsecret: e.target.value } })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" type="password" placeholder="输入 AppSecret" />
          </div>
        </div>
      </section>
    </div>
  )
}
