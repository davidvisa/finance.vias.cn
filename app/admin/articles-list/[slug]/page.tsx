"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function EditArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState("")
  const [title, setTitle] = useState("")
  const [summary, setSummary] = useState("")
  const [tags, setTags] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()

  useEffect(() => {
    params.then(p => {
      setSlug(p.slug)
      fetch(`/api/admin/drafts/${p.slug}`).then(r => r.json()).then(d => {
        if (d.error) return
        setTitle(d.title || "")
        setSummary(d.summary || "")
        setTags(d.tags || "")
        setContent(d.content || "")
        setLoading(false)
      })
    })
  }, [params])

  const saveManual = async () => {
    setSaving(true)
    setMessage("")
    const res = await fetch(`/api/admin/drafts/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, summary, tags, content }),
    })
    const data = await res.json()
    if (data.ok) {
      setMessage("✅ 已提交审核")
      setTimeout(() => router.push("/admin/articles"), 1500)
    } else {
      setMessage("❌ 保存失败")
    }
    setSaving(false)
  }

  const autoEdit = async () => {
    setAiLoading(true)
    setMessage("")
    const res = await fetch(`/api/admin/drafts/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ auto_edit: true }),
    })
    const data = await res.json()
    if (data.ok) {
      setTitle(data.title || title)
      setContent(data.content || content)
      setMessage("✅ AI 改写完成，已提交审核")
      setTimeout(() => router.push("/admin/articles"), 1500)
    } else {
      setMessage(`❌ AI 改写失败: ${data.error}`)
    }
    setAiLoading(false)
  }

  if (loading) return <p className="py-8 text-center text-gray-400">加载中...</p>

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">编辑文章</h1>
        <a href="/admin/articles-list" className="text-sm text-gray-500 hover:text-primary">&larr; 返回列表</a>
      </div>

      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">标题</label>
          <input value={title} onChange={e => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">摘要</label>
          <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={2}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">分类</label>
          <select value={tags} onChange={e => setTags(e.target.value)}
            className="mt-1 block w-48 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none">
            <option value="news">财经新闻</option>
            <option value="us_stock">美股</option>
            <option value="hk_stock">港股</option>
            <option value="macro">宏观经济</option>
            <option value="insurance">保险</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">正文 (Markdown)</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} rows={20}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-mono focus:border-primary focus:outline-none" />
        </div>
      </div>

      {message && (
        <div className={`rounded-lg px-4 py-3 text-sm ${message.startsWith("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
          {message}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={saveManual} disabled={saving}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-light disabled:opacity-50">
          {saving ? "保存中..." : "手动编辑 → 提交审核"}
        </button>
        <button onClick={autoEdit} disabled={aiLoading}
          className="rounded-lg border border-primary px-6 py-2.5 text-sm font-medium text-primary hover:bg-gray-50 disabled:opacity-50">
          {aiLoading ? "AI 改写中..." : "AI 自动改写 → 提交审核"}
        </button>
      </div>
    </div>
  )
}
