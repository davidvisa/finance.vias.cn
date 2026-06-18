"use client"

import { useState, useEffect } from "react"

interface ArticleItem {
  slug: string; title: string; date: string; summary: string; status: string
}

export default function ArticleReviewPage() {
  const [articles, setArticles] = useState<ArticleItem[]>([])
  const [tab, setTab] = useState("pending")

  const load = () => fetch(`/api/admin/articles?status=${tab}`).then(r => r.json()).then(setArticles)
  useEffect(() => { load() }, [tab])

  const updateStatus = async (slug: string, status: string) => {
    await fetch("/api/admin/articles", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, status }),
    })
    load()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">文章审核</h1>

      <div className="flex gap-2 border-b border-gray-200">
        {["pending", "draft", "published"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium ${tab === t ? "border-b-2 border-primary text-primary" : "text-gray-500 hover:text-gray-700"}`}>
            {t === "pending" ? "待审核" : t === "draft" ? "草稿" : "已发布"}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {articles.map(a => (
          <div key={a.slug} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-gray-800">{a.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{a.summary}</p>
                <p className="mt-1 text-xs text-gray-400">{a.date}</p>
              </div>
              <div className="flex gap-2">
                <a href={`/articles/${a.slug}`} target="_blank" className="rounded-lg border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50">预览</a>
                {tab === "pending" && (
                  <>
                    <button onClick={() => updateStatus(a.slug, "published")} className="rounded-lg bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700">通过</button>
                    <button onClick={() => updateStatus(a.slug, "draft")} className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-500 hover:bg-red-50">退回</button>
                  </>
                )}
                {tab === "published" && (
                  <button onClick={() => updateStatus(a.slug, "draft")} className="rounded-lg border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50">撤回</button>
                )}
              </div>
            </div>
          </div>
        ))}
        {articles.length === 0 && <p className="py-8 text-center text-gray-400">暂无文章</p>}
      </div>
    </div>
  )
}
