import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "全球股市开户",
  description: "美股、港股、A股等全球主要证券市场开户指引，低佣金券商推荐。",
}

export default function StockPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-12 py-8">
      <section className="text-center">
        <h1 className="text-3xl font-bold text-primary">全球股市开户服务</h1>
        <p className="mt-4 text-lg text-gray-600">
          覆盖美股、港股、A股等全球主要市场，为您推荐最优券商，轻松开启全球投资。
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          { market: "美股", brokers: "盈透、嘉信、富途、老虎", desc: "全球最大资本市场，交易品种丰富", icon: "🇺🇸" },
          { market: "港股", brokers: "富途、耀才、辉立、盈富", desc: "亚洲国际化程度最高的市场", icon: "🇭🇰" },
          { market: "A股", brokers: "中信、华泰、中金、招商", desc: "中国内地庞大市场，潜力巨大", icon: "🇨🇳" },
        ].map((item) => (
          <div key={item.market} className="rounded-xl border border-gray-200 bg-white p-6">
            <span className="text-3xl">{item.icon}</span>
            <h3 className="mt-3 text-lg font-semibold text-primary">{item.market}</h3>
            <p className="mt-1 text-sm text-gray-500">{item.brokers}</p>
            <p className="mt-2 text-sm text-gray-600">{item.desc}</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl bg-primary/5 p-8">
        <h2 className="text-xl font-semibold text-primary">开户流程</h2>
        <ol className="mt-4 space-y-3 text-gray-600">
          <li className="flex gap-2"><span className="font-bold text-primary">1.</span> 选择目标市场和券商</li>
          <li className="flex gap-2"><span className="font-bold text-primary">2.</span> 准备身份证明和地址证明</li>
          <li className="flex gap-2"><span className="font-bold text-primary">3.</span> 线上填写开户资料</li>
          <li className="flex gap-2"><span className="font-bold text-primary">4.</span> 券商审核通过，入金交易</li>
        </ol>
        <div className="mt-6 text-center">
          <Link href="/contact" className="inline-block rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-primary-light">
            立即咨询开户
          </Link>
        </div>
      </section>
    </div>
  )
}
