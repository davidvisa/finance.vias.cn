import Link from "next/link"

export default function HomePage() {
  return (
    <div className="space-y-16">
      <HeroSection />
      <ServiceCards />
      <LatestArticles />
    </div>
  )
}

function HeroSection() {
  return (
    <section className="py-16 text-center">
      <h1 className="text-4xl font-bold text-primary md:text-5xl">
        全球财经资讯 · 跨境金融服务
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
        每日更新全球财经资讯，提供美国银行卡开户、美股港股开户、香港储蓄保险等一站式跨境金融服务。
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Link href="/articles" className="rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-primary-light">
          浏览资讯
        </Link>
        <Link href="/contact" className="rounded-lg border border-primary px-6 py-3 font-medium text-primary hover:bg-gray-50">
          联系我们
        </Link>
      </div>
    </section>
  )
}

function ServiceCards() {
  const services = [
    { href: "/services/bank", title: "全球银行开户", desc: "美国、香港、新加坡等主流银行账户开设，全程线上办理。", icon: "🏦" },
    { href: "/services/stock", title: "全球股市开户", desc: "美股、港股、A股等全球主要证券市场开户及交易指导。", icon: "📈" },
    { href: "/services/insurance", title: "香港储蓄保险", desc: "香港热门储蓄型保险产品对比，专业投保方案规划。", icon: "🛡️" },
  ]
  return (
    <section>
      <h2 className="mb-8 text-center text-2xl font-bold text-primary">我们的服务</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {services.map((s) => (
          <Link key={s.href} href={s.href} className="rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg">
            <span className="text-3xl">{s.icon}</span>
            <h3 className="mt-4 text-lg font-semibold text-primary">{s.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{s.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

function LatestArticles() {
  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">最新财经资讯</h2>
        <Link href="/articles" className="text-sm font-medium text-primary-light hover:underline">查看全部 →</Link>
      </div>
      <p className="text-center text-gray-500 py-8">暂无文章，敬请期待。</p>
    </section>
  )
}
