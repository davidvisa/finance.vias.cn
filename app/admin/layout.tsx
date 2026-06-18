"use client"

import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/admin/auth").then(r => r.json()).then(d => { if (d.ok) setAuthed(true) }).catch(() => {})
  }, [])

  const login = async () => {
    const res = await fetch("/api/admin/auth", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })
    const data = await res.json()
    if (data.ok) { setAuthed(true); setError("") }
    else { setError("密码错误") }
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="w-96 rounded-xl bg-white p-8 shadow-lg">
          <h1 className="text-center text-xl font-bold text-primary">后台管理</h1>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="请输入管理密码" className="mt-4 block w-full rounded-lg border border-gray-300 px-4 py-2"
            onKeyDown={e => e.key === "Enter" && login()}
          />
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          <button onClick={login} className="mt-4 w-full rounded-lg bg-primary py-2 font-medium text-white hover:bg-primary-light">登录</button>
        </div>
      </div>
    )
  }

  const nav = [
    { href: "/admin", label: "概览", icon: "📊" },
    { href: "/admin/articles-list", label: "文章列表", icon: "📄" },
    { href: "/admin/articles", label: "文章审核", icon: "📝" },
    { href: "/admin/sources", label: "数据源管理", icon: "📡" },
    { href: "/admin/channels", label: "发布渠道", icon: "📤" },
    { href: "/admin/logs", label: "采集日志", icon: "📋" },
  ]

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-56 border-r border-gray-200 bg-white p-4">
        <div className="mb-6 text-lg font-bold text-primary">ViaFinance 管理</div>
        <nav className="space-y-1">
          {nav.map(item => (
            <a key={item.href} href={item.href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${pathname === item.href ? "bg-primary/10 font-medium text-primary" : "text-gray-600 hover:bg-gray-50"}`}
            >
              <span>{item.icon}</span> {item.label}
            </a>
          ))}
        </nav>
        <a href="/" className="mt-8 block text-center text-sm text-gray-400 hover:text-gray-600">← 返回前台</a>
      </aside>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  )
}
