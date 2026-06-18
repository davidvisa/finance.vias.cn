"use client"

import { useState, useEffect } from "react"

interface DraftArticle {
  slug: string; title: string; date: string; summary: string; tags: string; source: string
}

const CATEGORIES = [
  { value: "", label: "全部" },
  { value: "news", label: "财经新闻" },
  { value: "us_stock", label: "美股" },
  { value: "hk_stock", label: "港股" },
  { value: "macro", label: "宏观经济" },
  { value: "insurance", label: "保险" },
]

export default function ArticlesListPage() {
  const [articles, setArticles] = useState<DraftArticle[]>([])
  const [category, setCategory] = useState("")
  const [loading, setLoading] = useState(false)

  const load = async (cat: string) => {
    setLoading(true)
    const url = `/api/admin/drafts${cat ? `?category=${cat}` : ""}`
    const res = await fetch(url)
    setArticles(await res.json())
    setLoading(false)
  }

  useEffect(() => { load(category) }, [category])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">文章列表</h1>
      <p className="text-sm text-gray-500">采集到的文章草稿，可手动编辑或 AI 自动改写后提交审核。</p>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(c => (
          <button key={c.value} onClick={() => setCategory(c.value)}
            className={`rounded-lg px-4 py-1.5 text-sm ${category === c.value ? "bg-primary text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-8 text-center text-gray-400">加载中...</p>
      ) : articles.length === 0 ? (
        <p className="py-8 text-center text-gray-400">暂无文章，请先运行采集脚本</p>
      ) : (
        <div className="space-y-2">
          {articles.map(a => (
            <div key={a.slug} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-gray-800 truncate">{a.title}</h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">{a.summary}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                    <span>{a.date}</span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-500">{a.tags || "未分类"}</span>
                    <span>{a.source}</span>
                  </div>
                </div>
                <a href={`/admin/articles-list/${a.slug}`}
                  className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light">
                  编辑
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
