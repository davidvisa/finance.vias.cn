import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getArticleBySlug, getPublishedArticles } from "@/lib/content"
import { articleJsonLd } from "@/lib/schema"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) return {}
  return {
    title: article.title,
    description: article.summary,
    openGraph: {
      type: "article",
      title: article.title,
      description: article.summary,
      publishedTime: article.date,
    },
  }
}

export async function generateStaticParams() {
  return getPublishedArticles().map((a) => ({ slug: a.slug }))
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) notFound()

  const jsonLd = articleJsonLd({
    title: article.title,
    description: article.summary,
    date: article.date,
    url: `https://finance.vias.cn/articles/${slug}`,
  })

  return (
    <div className="mx-auto max-w-3xl py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href="/articles" className="text-sm text-gray-500 hover:text-primary">&larr; 返回资讯列表</Link>

      <article className="mt-6">
        <header>
          <h1 className="text-3xl font-bold text-primary">{article.title}</h1>
          <div className="mt-3 flex items-center gap-4 text-sm text-gray-400">
            <time>{article.date}</time>
            {article.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-500">{tag}</span>
            ))}
          </div>
        </header>
        <div className="mt-8 leading-relaxed text-gray-700 whitespace-pre-wrap">
          {article.content}
        </div>
      </article>

      <div className="mt-12 rounded-xl bg-primary/5 p-6 text-center">
        <p className="text-sm text-gray-600">对跨境金融服务感兴趣？</p>
        <Link href="/contact" className="mt-2 inline-block rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-light">
          联系我们
        </Link>
      </div>
    </div>
  )
}
