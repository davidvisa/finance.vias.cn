import type { Metadata } from "next"
import Link from "next/link"
import { getPublishedArticles } from "@/lib/content"

export const metadata: Metadata = {
  title: "财经资讯",
  description: "每日更新全球财经资讯，涵盖美股港股行情、宏观经济数据、国际财经新闻、金融政策法规、香港保险资讯。",
}

export default function ArticlesPage() {
  const articles = getPublishedArticles()

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <section className="text-center">
        <h1 className="text-3xl font-bold text-primary">财经资讯</h1>
        <p className="mt-2 text-gray-600">每日更新全球财经动态与市场分析</p>
      </section>

      {articles.length === 0 ? (
        <p className="py-16 text-center text-gray-500">暂无文章，敬请期待。</p>
      ) : (
        <div className="space-y-6">
          {articles.map((article) => (
            <Link key={article.slug} href={`/articles/${article.slug}`} className="block rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
              <h2 className="text-xl font-semibold text-primary">{article.title}</h2>
              <p className="mt-2 text-sm text-gray-600">{article.summary}</p>
              <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
                <time>{article.date}</time>
                {article.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-500">{tag}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
