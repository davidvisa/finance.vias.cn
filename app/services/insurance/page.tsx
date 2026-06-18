import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "香港储蓄保险",
  description: "香港热门储蓄型保险产品对比分析，专业投保方案规划，稳健资产配置。",
}

export default function InsurancePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-12 py-8">
      <section className="text-center">
        <h1 className="text-3xl font-bold text-primary">香港储蓄保险</h1>
        <p className="mt-4 text-lg text-gray-600">
          香港主流储蓄型保险产品对比，助您做明智的资产配置决策。
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {[
          { product: "友邦 - 充裕未来", features: "长期复利增长，美元保单，灵活提取", rate: "预期 IRR 5-6%" },
          { product: "保诚 - 隽富", features: "多元化资产配置，红利锁定选项", rate: "预期 IRR 5-6%" },
          { product: "宏利 - 环球货币", features: "多币种选择，传承规划，灵活缴费", rate: "预期 IRR 5-6%" },
          { product: "安盛 - 跃进", features: "高潜在回报，保费融资方案", rate: "预期 IRR 5-6.5%" },
        ].map((item) => (
          <div key={item.product} className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-primary">{item.product}</h3>
            <p className="mt-2 text-sm text-gray-600">{item.features}</p>
            <p className="mt-1 text-sm font-medium text-accent">{item.rate}</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl bg-primary/5 p-8">
        <h2 className="text-xl font-semibold text-primary">投保流程</h2>
        <ol className="mt-4 space-y-3 text-gray-600">
          <li className="flex gap-2"><span className="font-bold text-primary">1.</span> 需求分析，确定预算和目标</li>
          <li className="flex gap-2"><span className="font-bold text-primary">2.</span> 产品对比，推荐最优方案</li>
          <li className="flex gap-2"><span className="font-bold text-primary">3.</span> 赴港签约或远程投保</li>
          <li className="flex gap-2"><span className="font-bold text-primary">4.</span> 核保通过，缴纳保费</li>
          <li className="flex gap-2"><span className="font-bold text-primary">5.</span> 保单生效，后续服务跟进</li>
        </ol>
        <div className="mt-6 text-center">
          <Link href="/contact" className="inline-block rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-primary-light">
            立即咨询投保
          </Link>
        </div>
      </section>
    </div>
  )
}
